export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { ComfortLevel, TripBrief } from "../../../components/tripBrief";
import { getSql } from "../../../lib/db";
import { getStripe } from "../../../lib/stripe";

type ServicePack = "audit" | "itinerary" | "concierge";
type DeliverySpeed = "standard" | "urgent";

type CheckoutPayload = {
  email: string;
  notes: string;
  pack: ServicePack;
  speed: DeliverySpeed;
  priceEUR?: number;
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
  createdAt: string;
};

const PACK_PRICE_EUR: Record<ServicePack, number> = {
  audit: 19,
  itinerary: 49,
  concierge: 99,
};

const URGENT_FEE_EUR = 20;

function computePriceEUR(pack: ServicePack, speed: DeliverySpeed) {
  const base = PACK_PRICE_EUR[pack];
  const urgent = speed === "urgent" ? URGENT_FEE_EUR : 0;
  return base + urgent;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function isPack(v: string): v is ServicePack {
  return v === "audit" || v === "itinerary" || v === "concierge";
}
function isSpeed(v: string): v is DeliverySpeed {
  return v === "standard" || v === "urgent";
}
function isComfortLevelOrNull(v: unknown): v is ComfortLevel | null {
  return v === null || v === "eco" || v === "comfort" || v === "premium";
}
function parseClientDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid createdAt");
  return d.toISOString();
}

export async function POST(req: Request) {
  let body: CheckoutPayload;

  try {
    body = (await req.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!isEmail(body.email))
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 },
    );
  if (!isPack(body.pack))
    return NextResponse.json(
      { ok: false, error: "Invalid pack" },
      { status: 400 },
    );
  if (!isSpeed(body.speed))
    return NextResponse.json(
      { ok: false, error: "Invalid speed" },
      { status: 400 },
    );
  if (!isComfortLevelOrNull(body.selectedPlan))
    return NextResponse.json(
      { ok: false, error: "Invalid plan" },
      { status: 400 },
    );
  if (!body.brief || typeof body.brief !== "object")
    return NextResponse.json(
      { ok: false, error: "Invalid brief" },
      { status: 400 },
    );

  const computedPriceEUR = computePriceEUR(body.pack, body.speed);

  if (typeof body.priceEUR === "number" && body.priceEUR !== computedPriceEUR) {
    console.warn("[Traveltactik] Price mismatch from client", {
      client: body.priceEUR,
      computed: computedPriceEUR,
      pack: body.pack,
      speed: body.speed,
      email: body.email,
    });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://travel-tactik.com";
  const ua = req.headers.get("user-agent") ?? null;

  try {
    const sql = getSql();
    const createdAtISO = parseClientDate(body.createdAt);

    // 1) Create lead (pending payment)
    const rows = await sql`
      insert into leads (
        email, notes, pack, speed, price_eur, brief, selected_plan,
        client_created_at, user_agent, payment_status
      )
      values (
        ${body.email},
        ${body.notes ?? ""},
        ${body.pack},
        ${body.speed},
        ${computedPriceEUR},
        ${JSON.stringify(body.brief)}::jsonb,
        ${body.selectedPlan},
        ${createdAtISO}::timestamptz,
        ${ua},
        'pending'
      )
      returning id;
    `;

    const leadId = rows?.[0]?.id;
    if (!leadId) throw new Error("Insert failed (no id returned)");

    // 2) Stripe Checkout
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: body.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(computedPriceEUR * 100),
            product_data: {
              name: `TravelTactik — ${body.pack} (${body.speed})`,
              description: `Destination: ${body.brief.destination || "Flexible"} — Durée: ${body.brief.durationDays}j — Voyageurs: ${body.brief.travelers}`,
            },
          },
        },
      ],
      metadata: {
        leadId: String(leadId),
        pack: body.pack,
        speed: body.speed,
      },
      success_url: `${siteUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/paiement/annule?lead_id=${encodeURIComponent(String(leadId))}`,
    });

    // store session id
    await sql`
      update leads
      set stripe_session_id = ${session.id}
      where id = ${leadId};
    `;

    return NextResponse.json(
      { ok: true, url: session.url, leadId, priceEUR: computedPriceEUR },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error("[Traveltactik] /api/checkout error:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
