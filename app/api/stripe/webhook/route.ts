export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";

import { getStripe } from "../../../../lib/stripe";
import { getSql } from "../../../../lib/db";
import { sendPaymentConfirmedEmails } from "../../../../lib/mailer";

// simple UUID v4/v7-ish check (suffisant pour éviter du garbage)
function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

async function handleCheckoutPaid(event: Stripe.Event) {
  const stripe = getStripe();
  const sql = getSql();

  const session = event.data.object as Stripe.Checkout.Session;

  const leadId = session.metadata?.leadId;
  if (!isUuid(leadId)) {
    console.warn("[Stripe webhook] missing/invalid leadId in metadata", {
      leadId,
      sessionId: session.id,
    });
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  // 1) Idempotence: n'exécuter qu'une fois (si déjà 'paid', on stop)
  // On update seulement si pas encore payé
  const updated = await sql`
    update leads
    set payment_status = 'paid',
        stripe_session_id = ${session.id},
        stripe_payment_intent_id = ${paymentIntentId},
        paid_at = now()
    where id = ${leadId}
      and (payment_status is null or payment_status <> 'paid')
    returning id;
  `;

  // Si 0 lignes: déjà traité -> on sort sans renvoyer d'emails
  if (!updated?.length) {
    console.log("[Stripe webhook] already processed", {
      leadId,
      sessionId: session.id,
      eventId: event.id,
    });
    return;
  }

  await sql`
    update leads
    set brief = case
      when brief is null then brief
      else jsonb_set(brief, '{status}', '"accepted"'::jsonb, true)
    end
    where id = ${leadId};
  `;

  // 1bis) Create pending documents for this paid lead (idempotent)
  await sql`
  insert into lead_documents (lead_id, doc_type, status)
  values
    (${leadId}::uuid, 'tarifs', 'pending'),
    (${leadId}::uuid, 'carnet', 'pending')
  on conflict (lead_id, doc_type) do nothing;
`;

  // 2) Recharge les infos lead pour email
  const rows = await sql`
    select
      email,
      notes,
      pack,
      speed,
      price_eur,
      brief,
      selected_plan,
      client_created_at
    from leads
    where id = ${leadId}
    limit 1;
  `;

  const lead = rows?.[0];
  if (!lead) return;

  await sendPaymentConfirmedEmails({
    leadId: String(leadId),
    email: String(lead.email),
    destination: String(lead?.brief?.destination || ""),
    priceEUR: Number(lead.price_eur || 0),
  });
}

export async function POST(req: Request) {
  const stripe = getStripe();

  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { ok: false, error: "Missing webhook config" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      secret,
    ) as Stripe.Event;
  } catch (err) {
    console.error("[Stripe webhook] signature verification failed:", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    // Events "paid"
    if (event.type === "checkout.session.completed") {
      await handleCheckoutPaid(event);
    }

    // Optionnel (paiements async)
    if (event.type === "checkout.session.async_payment_succeeded") {
      await handleCheckoutPaid(event);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Stripe webhook] handler error:", err);
    // Stripe va retenter sur 5xx -> OK si idempotent
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
