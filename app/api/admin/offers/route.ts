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

const TIERS = ["eco", "comfort", "premium"] as const;

type Category = (typeof CATEGORIES)[number];
type Tier = (typeof TIERS)[number];

function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}
function isTier(v: unknown): v is Tier {
  return typeof v === "string" && (TIERS as readonly string[]).includes(v);
}
function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

// slug helper (stable + lisible)
function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
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

  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get("q") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const tier = (searchParams.get("tier") || "").trim();
    const published = (searchParams.get("published") || "").trim(); // "" | "true" | "false"
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "200", 10) || 200,
      500,
    );

    const sql = getSql();

    const rows = await sql`
      select
        id,
        slug,
        title,
        destination,
        image_url,
        category,
        tier,
        price_from_eur,
        duration_days,
        persons,
        departure_city,
        departure_airport,
        is_published,
        tags,
        meta,
        created_at,
        updated_at
      from offers
      where
        (${q} = '' or
          title ilike ${"%" + q + "%"} or
          destination ilike ${"%" + q + "%"} or
          slug ilike ${"%" + q + "%"} or
          coalesce(departure_city,'') ilike ${"%" + q + "%"} or
          coalesce(departure_airport,'') ilike ${"%" + q + "%"}
        )
        and (${category} = '' or category = ${category})
        and (${tier} = '' or tier = ${tier})
        and (
          ${published} = '' or
          is_published = (${published} = 'true')
        )
      order by updated_at desc
      limit ${limit};
    `;

    return NextResponse.json({ ok: true, rows }, { status: 200 });
  } catch (err) {
    console.error("[api/admin/offers] GET error:", err);
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
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON" },
        { status: 400 },
      );
    }

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const destination =
      typeof body?.destination === "string" ? body.destination.trim() : "";
    const category = body?.category;
    const tier = body?.tier;

    if (title.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Title too short" },
        { status: 400 },
      );
    }
    if (destination.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Destination too short" },
        { status: 400 },
      );
    }
    if (category && !isCategory(category)) {
      return NextResponse.json(
        { ok: false, error: "Invalid category" },
        { status: 400 },
      );
    }
    if (tier && !isTier(tier)) {
      return NextResponse.json(
        { ok: false, error: "Invalid tier" },
        { status: 400 },
      );
    }

    const baseSlug =
      slugify(`${destination}-${title}`) || slugify(title) || "offer";
    // éviter collisions : suffixe court
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const sql = getSql();
    const meta = body?.meta && typeof body.meta === "object" ? body.meta : {};

    const rows = await sql`
      insert into offers (
        slug, title, destination, image_url, category, tier,
        price_from_eur, duration_days, persons,
        departure_city, departure_airport,
        tags, meta, is_published, updated_at
      )
      values (
        ${slug},
        ${title},
        ${destination},
        ${typeof body?.image_url === "string" && body.image_url.trim() ? body.image_url.trim() : null},
        ${category || null},
        ${tier || null},
        ${typeof body?.price_from_eur === "number" ? Math.max(0, Math.trunc(body.price_from_eur)) : null},
        ${typeof body?.duration_days === "number" ? Math.max(1, Math.trunc(body.duration_days)) : null},
        ${typeof body?.persons === "number" ? Math.max(1, Math.trunc(body.persons)) : null},
        ${typeof body?.departure_city === "string" && body.departure_city.trim() ? body.departure_city.trim() : null},
        ${typeof body?.departure_airport === "string" && body.departure_airport.trim() ? body.departure_airport.trim() : null},
        ${Array.isArray(body?.tags) ? body.tags : []},
        ${JSON.stringify(meta)}::jsonb,
        ${typeof body?.is_published === "boolean" ? body.is_published : true},
        now()
      )
      returning
        id, slug, title, destination, image_url, category, tier,
        price_from_eur, duration_days, persons,
        departure_city, departure_airport,
        is_published, tags, meta, created_at, updated_at;
    `;

    return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/offers] POST error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
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

    const category = body?.category;
    const tier = body?.tier;

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

    const nextTier =
      tier === null || tier === "" ? null : isTier(tier) ? tier : "__invalid__";
    if (nextTier === "__invalid__") {
      return NextResponse.json(
        { ok: false, error: "Invalid tier" },
        { status: 400 },
      );
    }

    const sql = getSql();
    const meta = body?.meta && typeof body.meta === "object" ? body.meta : null;

    const rows = await sql`
      update offers
      set
        title = coalesce(${typeof body?.title === "string" ? body.title.trim() : null}, title),
        destination = coalesce(${typeof body?.destination === "string" ? body.destination.trim() : null}, destination),
        image_url = coalesce(${typeof body?.image_url === "string" ? body.image_url.trim() : null}, image_url),
        category = ${nextCategory},
        tier = ${nextTier},
        price_from_eur = coalesce(${typeof body?.price_from_eur === "number" ? Math.max(0, Math.trunc(body.price_from_eur)) : null}, price_from_eur),
        duration_days = coalesce(${typeof body?.duration_days === "number" ? Math.max(1, Math.trunc(body.duration_days)) : null}, duration_days),
        persons = coalesce(${typeof body?.persons === "number" ? Math.max(1, Math.trunc(body.persons)) : null}, persons),
        departure_city = coalesce(${typeof body?.departure_city === "string" ? body.departure_city.trim() : null}, departure_city),
        departure_airport = coalesce(${typeof body?.departure_airport === "string" ? body.departure_airport.trim() : null}, departure_airport),
        is_published = coalesce(${typeof body?.is_published === "boolean" ? body.is_published : null}, is_published),
        meta = coalesce(${meta ? JSON.stringify(meta) : null}::jsonb, meta),
        updated_at = now()
      where id = ${id}::uuid
      returning
        id, slug, title, destination, image_url, category, tier,
        price_from_eur, duration_days, persons,
        departure_city, departure_airport,
        is_published, tags, meta, created_at, updated_at;
    `;

    return NextResponse.json({ ok: true, row: rows?.[0] }, { status: 200 });
  } catch (err) {
    console.error("[api/admin/offers] PATCH error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
