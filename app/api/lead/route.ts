// app/api/lead/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { ComfortLevel, TripBrief } from "../../../components/tripBrief";

import { getSql } from "../../../lib/db";
import { sendLeadEmails } from "../../../lib/mailer";

type ServicePack = "audit" | "itinerary" | "concierge";
type DeliverySpeed = "standard" | "urgent";

type LeadPayload = {
  email: string;
  notes: string;
  pack: ServicePack;
  speed: DeliverySpeed;
  priceEUR: number;
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
  createdAt: string;
};

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

// Petit helper: timeout sur une promise (évite les hangs)
async function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let t: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(
      () => reject(new Error(`Timeout after ${ms}ms (${label})`)),
      ms,
    );
  });

  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

// Normalise une date ISO côté serveur (et fail si invalide)
function parseClientDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid createdAt");
  return d.toISOString();
}

export async function POST(req: Request) {
  let body: LeadPayload;

  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Validation minimale MVP
  if (!isEmail(body.email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 },
    );
  }
  if (!isPack(body.pack)) {
    return NextResponse.json(
      { ok: false, error: "Invalid pack" },
      { status: 400 },
    );
  }
  if (!isSpeed(body.speed)) {
    return NextResponse.json(
      { ok: false, error: "Invalid speed" },
      { status: 400 },
    );
  }
  if (!isComfortLevelOrNull(body.selectedPlan)) {
    return NextResponse.json(
      { ok: false, error: "Invalid plan" },
      { status: 400 },
    );
  }
  if (!body.brief || typeof body.brief !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid brief" },
      { status: 400 },
    );
  }

  const ua = req.headers.get("user-agent") ?? null;

  // Log utile (avant DB)
  console.log("[Traveltactik] Lead received:", {
    email: body.email,
    pack: body.pack,
    speed: body.speed,
    priceEUR: body.priceEUR,
    selectedPlan: body.selectedPlan,
    destination: body.brief?.destination,
    durationDays: body.brief?.durationDays,
    travelers: body.brief?.travelers,
    budgetMax: body.brief?.budgetMax,
    avoidLayovers: body.brief?.avoidLayovers,
    createdAt: body.createdAt,
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    resendFrom: process.env.RESEND_FROM,
    notificationEmail: process.env.LEADS_NOTIFICATION_EMAIL,
  });

  try {
    const sql = getSql();

    const createdAtISO = parseClientDate(body.createdAt);

    // INSERT + retour de l'id
    const rows = await sql`
      insert into leads (
        email,
        notes,
        pack,
        speed,
        price_eur,
        brief,
        selected_plan,
        client_created_at,
        user_agent
      )
      values (
        ${body.email},
        ${body.notes ?? ""},
        ${body.pack},
        ${body.speed},
        ${body.priceEUR},
        ${JSON.stringify(body.brief)}::jsonb,
        ${body.selectedPlan},
        ${createdAtISO}::timestamptz,
        ${ua}
      )
      returning id;
    `;

    const leadId = rows?.[0]?.id;
    if (!leadId) throw new Error("Insert failed (no id returned)");

    console.log("[Traveltactik] Lead inserted:", { leadId });

    // Emails (log avant / après) + timeout
    console.log("[Traveltactik] before sendLeadEmails", {
      leadId: String(leadId),
      to: body.email,
      from: process.env.RESEND_FROM,
      notify: process.env.LEADS_NOTIFICATION_EMAIL,
    });

    const emailResult = await withTimeout(
      sendLeadEmails(String(leadId), body),
      15000,
      "sendLeadEmails",
    );

    console.log("[Traveltactik] sendLeadEmails OK", { leadId, emailResult });

    return NextResponse.json({ ok: true, leadId }, { status: 200 });
  } catch (err) {
    console.error("[Traveltactik] /api/lead error:", err);

    // Remonte une erreur plus explicite en dev
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
