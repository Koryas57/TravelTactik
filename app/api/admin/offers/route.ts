export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth";
import { getSql } from "../../../../lib/db";

const CATEGORIES = [
  "Aventure",
  "Découverte Culturelle",
  "CityTrip",
  "Ski",
  "Calme Absolu",
  "Plage & Détente",
  "Montagne & Treks",
  "En famille",
  "En couple",
  "En solo",
  "Experiences/Evenements",
  "Week-end",
  "Mois Entier",
] as const;

type Category = (typeof CATEGORIES)[number];

function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
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

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const tier = (searchParams.get("tier") || "").trim(); // eco|comfort|premium (optionnel)
  const limit = Math.min(
    parseInt(searchParams.get("limit") || "100", 10) || 100,
    200,
  );

  const sql = getSql();

  // min_price (fiable) via table tiers, sinon fallback offers.price_from_eur
  const rows = await sql`
    select
      o.id,
      o.slug,
      o.title,
      o.destination,
      o.image_url,
      o.category,
      o.tags,
      o.meta,
      o.created_at,
      o.updated_at,
      coalesce(min(t.from_price_eur) filter (where t.from_price_eur is not null), o.price_from_eur) as min_price_eur,
      jsonb_agg(
        jsonb_build_object(
          'tier', t.tier,
          'from_price_eur', t.from_price_eur,
          'summary', t.summary,
          'is_active', t.is_active
        )
        order by t.tier asc
      ) filter (where t.id is not null) as tiers
    from offers o
    left join offer_tiers t on t.offer_id = o.id
    where
      (${q} = '' or
        o.title ilike ${"%" + q + "%"} or
        o.destination ilike ${"%" + q + "%"} or
        o.slug ilike ${"%" + q + "%"}
      )
      and (${category} = '' or o.category = ${category})
      and (${tier} = '' or exists (
        select 1 from offer_tiers t2
        where t2.offer_id = o.id and t2.tier = ${tier}
      ))
    group by o.id
    order by o.updated_at desc
    limit ${limit};
  `;

  return NextResponse.json({ ok: true, rows }, { status: 200 });
}

export async function PATCH(req: Request) {
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

  const id = body?.id;
  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 },
    );
  }

  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const destination =
    typeof body?.destination === "string" ? body.destination.trim() : null;
  const imageUrl =
    typeof body?.image_url === "string" ? body.image_url.trim() : null;
  const category = body?.category;

  if (title !== null && title.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Title too short" },
      { status: 400 },
    );
  }
  if (destination !== null && destination.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Destination too short" },
      { status: 400 },
    );
  }

  // category peut être null (draft)
  const nextCategory =
    category === null || category === ""
      ? null
      : isCategory(category)
        ? category
        : "__invalid__";

  if (nextCategory === "__invalid__") {
    return NextResponse.json(
      { ok: false, error: "Invalid category" },
      { status: 400 },
    );
  }

  const sql = getSql();

  const rows = await sql`
    update offers
    set
      title = coalesce(${title}, title),
      destination = coalesce(${destination}, destination),
      image_url = coalesce(${imageUrl}, image_url),
      category = ${nextCategory},
      updated_at = now()
    where id = ${id}::uuid
    returning id, slug, title, destination, image_url, category, updated_at;
  `;

  return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
}
