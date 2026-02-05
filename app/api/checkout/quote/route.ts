export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { getSql } from "../../../../lib/db";
import { getStripe } from "../../../../lib/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const leadId = typeof body?.leadId === "string" ? body.leadId : "";

    if (!leadId) {
      return NextResponse.json(
        { ok: false, error: "leadId missing" },
        { status: 400 },
      );
    }

    const sql = getSql();
    const rows = await sql`
      select id, email, price_eur, brief, payment_status
      from leads
      where id = ${leadId}::uuid
        and lower(email) = ${email}
      limit 1;
    `;

    const lead = rows?.[0];
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Quote not found" },
        { status: 404 },
      );
    }
    if (lead.payment_status === "paid") {
      return NextResponse.json(
        { ok: false, error: "Quote already paid" },
        { status: 400 },
      );
    }

    const priceEUR = Number(lead.price_eur || 0);
    if (!priceEUR) {
      return NextResponse.json(
        { ok: false, error: "Quote missing price" },
        { status: 400 },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://travel-tactik.com";
    const stripe = getStripe();

    const sessionCheckout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: Math.round(priceEUR * 100),
            product_data: {
              name: `TravelTactik — Devis personnalisé`,
              description: String(lead.brief?.destination || "Devis voyage"),
            },
          },
        },
      ],
      metadata: {
        leadId: String(lead.id),
        pack: "audit",
        speed: "standard",
      },
      success_url: `${siteUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/paiement/annule?lead_id=${encodeURIComponent(String(lead.id))}`,
    });

    await sql`
      update leads
      set stripe_session_id = ${sessionCheckout.id}
      where id = ${lead.id};
    `;

    return NextResponse.json(
      { ok: true, url: sessionCheckout.url },
      { status: 200 },
    );
  } catch (error) {
    console.error("[api/checkout/quote] error:", error);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
