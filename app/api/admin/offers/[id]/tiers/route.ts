export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSql } from "../../../../../../lib/db";

type Tier = "eco" | "comfort" | "premium";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function isTier(v: unknown): v is Tier {
  return v === "eco" || v === "comfort" || v === "premium";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  let body: {
    tier?: unknown;
    from_price_eur?: unknown;
    summary?: unknown;
    details?: unknown;
  };
  try {
    body = (await req.json()) as any;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!isTier(body.tier)) {
    return NextResponse.json(
      { ok: false, error: "Invalid tier" },
      { status: 400 },
    );
  }

  const fromPrice =
    typeof body.from_price_eur === "number"
      ? Math.floor(body.from_price_eur)
      : typeof body.from_price_eur === "string"
        ? Math.floor(Number.parseInt(body.from_price_eur, 10))
        : NaN;

  if (!Number.isFinite(fromPrice) || fromPrice < 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid from_price_eur" },
      { status: 400 },
    );
  }

  const summary = typeof body.summary === "string" ? body.summary.trim() : null;
  const details =
    typeof body.details === "object" && body.details !== null
      ? body.details
      : [];

  const sql = getSql();

  const rows = await sql`
    insert into offer_tiers (offer_id, tier, from_price_eur, summary, details, updated_at)
    values (${id}::uuid, ${body.tier}, ${fromPrice}, ${summary}, ${details}::jsonb, now())
    on conflict (offer_id, tier)
    do update set
      from_price_eur = excluded.from_price_eur,
      summary = excluded.summary,
      details = excluded.details,
      updated_at = now()
    returning *;
  `;

  return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
}
