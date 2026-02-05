export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSql } from "../../../../../../lib/db";
import { sendLeadDeliveredEmail } from "../../../../../../lib/mailer";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  try {
    const sql = getSql();

    // 1) Charger le lead (pour décider toggle + validations)
    const leadRows = await sql`
      select
        id,
        email,
        payment_status,
        handled,
        handled_at,
        delivered_at,
        delivered_email_sent_at
      from leads
      where id = ${id}::uuid
      limit 1;
    `;

    const lead = leadRows?.[0];
    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 },
      );
    }

    const currentlyHandled = Boolean(lead.handled);
    const nextHandled = !currentlyHandled;

    // 2) Si on veut passer à "traité", on impose les règles métier
    if (nextHandled) {
      if (lead.payment_status !== "paid") {
        return NextResponse.json(
          {
            ok: false,
            error: "Paiement requis avant de marquer comme traité.",
          },
          { status: 400 },
        );
      }

      // Vérifie que le document Tarifs est READY + URL (Carnet facultatif)
      const docsCountRows = await sql`
        select count(*)::int as ready_count
        from lead_documents
        where lead_id = ${id}::uuid
          and doc_type = 'tarifs'
          and status = 'ready'
          and url is not null
          and length(trim(url)) > 0;
      `;
      const readyCount = docsCountRows?.[0]?.ready_count ?? 0;

      if (readyCount < 1) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Document Tarifs manquant: le PDF Tarifs doit être en 'ready' avec une URL avant de marquer comme traité. Le Carnet de voyage reste facultatif.",
          },
          { status: 400 },
        );
      }
    }

    // 3) Toggle handled
    const updatedRows = await sql`
      update leads
      set
        handled = ${nextHandled},
        handled_at = case when ${nextHandled} then now() else null end
      where id = ${id}::uuid
      returning
        id,
        email,
        payment_status,
        handled,
        handled_at,
        delivered_at,
        delivered_email_sent_at;
    `;

    const updated = updatedRows?.[0];

    // 4) Si on vient de passer en traité, et que l'email n'a jamais été envoyé => on envoie 1 fois
    // Idempotence: delivered_email_sent_at != null => jamais de renvoi.
    if (nextHandled && updated && !updated.delivered_email_sent_at) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "https://travel-tactik.com";

      const plansUrl = `${baseUrl.replace(/\/$/, "")}/app/plans`;

      // Envoi email (mode prod/test géré dans mailer.ts)
      await sendLeadDeliveredEmail({
        leadId: String(id),
        email: String(updated.email),
        plansUrl,
      });

      // Marque "email envoyé" (si l'envoi a réussi)
      await sql`
        update leads
        set
          delivered_email_sent_at = now(),
          delivered_at = coalesce(delivered_at, now())
        where id = ${id}::uuid
          and delivered_email_sent_at is null;
      `;
    }

    return NextResponse.json({ ok: true, row: updated }, { status: 200 });
  } catch (err) {
    console.error("[admin/leads/[id]/handled] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
