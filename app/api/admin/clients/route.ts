export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { getSql } from "../../../../lib/db";
import { sendLeadDeliveredEmail } from "../../../../lib/mailer";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !allowed.includes(email)) return null;
  return { email };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const sql = getSql();

    await sql`
      delete from leads
      where coalesce(payment_status, 'pending') <> 'paid'
        and brief ? 'status'
        and brief->>'status' = 'published'
        and brief ? 'expiresAt'
        and brief->>'expiresAt' ~ '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}'
        and (brief->>'expiresAt')::timestamptz < now();
    `;

    const rows = await sql`
      select
        u.id as user_id,
        u.email,
        u.name,
        u.image,
        u.updated_at as last_seen_at,
        l.id as quote_id,
        l.notes as call_summary,
        l.price_eur,
        l.payment_status,
        l.brief,
        l.created_at as quote_created_at,
        l.created_at as quote_updated_at
      from users u
      left join lateral (
        select *
        from leads l
        where l.user_id = u.id
        order by l.created_at desc
        limit 1
      ) l on true
      order by u.updated_at desc
      limit 300;
    `;

    return NextResponse.json({ ok: true, rows }, { status: 200 });
  } catch (error) {
    console.error("[api/admin/clients] GET error:", error);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const userId = typeof body?.userId === "string" ? body.userId : "";
    const email =
      typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    const destination =
      typeof body?.destination === "string" ? body.destination.trim() : "";
    const callSummary =
      typeof body?.callSummary === "string" ? body.callSummary.trim() : "";
    const quoteDetails =
      typeof body?.quoteDetails === "string" ? body.quoteDetails.trim() : "";
    const priceEUR =
      typeof body?.priceEUR === "number"
        ? Math.max(0, Math.trunc(body.priceEUR))
        : 0;
    const publish = Boolean(body?.publish);

    if (
      !userId ||
      !email ||
      !destination ||
      !callSummary ||
      !quoteDetails ||
      !priceEUR
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const sql = getSql();
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();

    const brief = {
      destination,
      durationDays:
        typeof body?.durationDays === "number"
          ? Math.max(1, Math.trunc(body.durationDays))
          : 7,
      travelers:
        typeof body?.travelers === "number"
          ? Math.max(1, Math.trunc(body.travelers))
          : 2,
      budgetMax:
        typeof body?.budgetMax === "number"
          ? Math.max(0, Math.trunc(body.budgetMax))
          : priceEUR,
      quoteDetails,
      status: publish ? "published" : "draft",
      publishedAt: publish ? new Date().toISOString() : null,
      expiresAt: publish ? expiresAt : null,
      avoidLayovers: false,
      comfort: "comfort",
    };

    const rows = await sql`
      insert into leads (
        user_id,
        email,
        notes,
        pack,
        speed,
        price_eur,
        brief,
        selected_plan,
        client_created_at,
        payment_status
      )
      values (
        ${userId}::uuid,
        ${email},
        ${callSummary},
        'audit',
        'standard',
        ${priceEUR},
        ${JSON.stringify(brief)}::jsonb,
        null,
        now(),
        'pending'
      )
      returning id;
    `;

    const quoteId = rows?.[0]?.id;

    if (publish && quoteId) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "https://travel-tactik.com";
      const plansUrl = `${baseUrl.replace(/\/$/, "")}/app/plans`;

      await sendLeadDeliveredEmail({
        leadId: String(quoteId),
        email,
        plansUrl,
      });
    }

    return NextResponse.json({ ok: true, quoteId }, { status: 200 });
  } catch (error) {
    console.error("[api/admin/clients] POST error:", error);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
