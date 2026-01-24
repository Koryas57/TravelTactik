export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../auth";
import { getSql } from "../../../../../lib/db";

type Tier = "eco" | "comfort" | "premium";

function isTier(v: unknown): v is Tier {
  return v === "eco" || v === "comfort" || v === "premium";
}

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

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

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const offerId = body?.offerId;
  const tier = body?.tier;
  const fromPrice = body?.from_price_eur;
  const summary = typeof body?.summary === "string" ? body.summary.trim() : "";
  const isActive = typeof body?.is_active === "boolean" ? body.is_active : true;

  if (!isUuid(offerId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid offerId" },
      { status: 400 },
    );
  }
  if (!isTier(tier)) {
    return NextResponse.json(
      { ok: false, error: "Invalid tier" },
      { status: 400 },
    );
  }

  const nextPrice =
    fromPrice === null || fromPrice === "" || typeof fromPrice === "undefined"
      ? null
      : Number.isFinite(Number(fromPrice))
        ? Math.max(0, Math.trunc(Number(fromPrice)))
        : NaN;

  if (Number.isNaN(nextPrice as any)) {
    return NextResponse.json(
      { ok: false, error: "Invalid price" },
      { status: 400 },
    );
  }

  const sql = getSql();

  const rows = await sql`
    insert into offer_tiers (offer_id, tier, from_price_eur, summary, is_active)
    values (${offerId}::uuid, ${tier}, ${nextPrice}, ${summary}, ${isActive})
    on conflict (offer_id, tier)
    do update set
      from_price_eur = excluded.from_price_eur,
      summary = excluded.summary,
      is_active = excluded.is_active,
      updated_at = now()
    returning offer_id, tier, from_price_eur, summary, is_active, updated_at;
  `;

  return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
}
