// app/api/offers/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSql } from "../../../lib/db";

type Tier = "eco" | "comfort" | "premium";
type Sort = "recent" | "price_asc" | "price_desc";

const ALLOWED_CATEGORIES = new Set([
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
]);

function isTier(v: string | null): v is Tier {
  return v === "eco" || v === "comfort" || v === "premium";
}

function isSort(v: string | null): v is Sort {
  return v === "recent" || v === "price_asc" || v === "price_desc";
}

function cleanLike(s: string) {
  // évite les %/_ non voulus dans un ILIKE
  return s.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function splitTokens(input: string) {
  return input
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql();
    const sp = req.nextUrl.searchParams;

    const category = sp.get("category");
    const from = sp.get("from"); // ville départ (texte)
    const to = sp.get("to"); // destination (texte)
    const q = sp.get("q"); // mots-clés
    const tier = sp.get("tier");
    const maxPriceRaw = sp.get("maxPrice");
    const limitRaw = sp.get("limit");
    const sortRaw = sp.get("sort");

    const limit = Math.max(
      1,
      Math.min(200, Number.parseInt(limitRaw || "60", 10) || 60),
    );

    const sort: Sort = isSort(sortRaw) ? sortRaw : "recent";

    if (category && !ALLOWED_CATEGORIES.has(category)) {
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

    const maxPrice =
      maxPriceRaw && maxPriceRaw.trim() !== ""
        ? Number.parseInt(maxPriceRaw, 10)
        : null;

    if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
      return NextResponse.json(
        { ok: false, error: "Invalid maxPrice" },
        { status: 400 },
      );
    }

    // ORDER BY
    const orderSql =
      sort === "price_asc"
        ? sql`o.price_from_eur asc nulls last, o.updated_at desc`
        : sort === "price_desc"
          ? sql`o.price_from_eur desc nulls last, o.updated_at desc`
          : sql`o.updated_at desc`;

    // WHERE (construction propre)
    let where = sql`o.is_published = true`;

    // category
    if (category) {
      where = sql`${where} and o.category = ${category}`;
    }

    // tier
    if (tier) {
      where = sql`${where} and o.tier = ${tier}`;
    }

    // maxPrice (null = ignore)
    if (maxPrice !== null) {
      where = sql`${where} and coalesce(o.price_from_eur, 2147483647) <= ${maxPrice}`;
    }

    // from (match departure city/airport)
    if (from && from.trim()) {
      const fromLike = `%${cleanLike(from.trim())}%`;
      where = sql`${where} and (
        coalesce(o.departure_city,'') ilike ${fromLike} escape '\\'
        or coalesce(o.departure_airport,'') ilike ${fromLike} escape '\\'
      )`;
    }

    // to (destination) -> NOW matches destination OR title OR slug
    // Multi-mots: chaque token doit matcher au moins une des colonnes.
    if (to && to.trim()) {
      const tokens = splitTokens(to);
      for (const token of tokens) {
        const like = `%${cleanLike(token)}%`;
        where = sql`${where} and (
          coalesce(o.destination,'') ilike ${like} escape '\\'
          or coalesce(o.title,'') ilike ${like} escape '\\'
          or coalesce(o.slug,'') ilike ${like} escape '\\'
        )`;
      }
    }

    // q (mots-clés) : on garde ton comportement + ajout slug
    if (q && q.trim()) {
      const qLike = `%${cleanLike(q.trim())}%`;
      where = sql`${where} and (
        coalesce(o.title,'') ilike ${qLike} escape '\\'
        or coalesce(o.slug,'') ilike ${qLike} escape '\\'
        or coalesce(o.destination,'') ilike ${qLike} escape '\\'
        or coalesce(o.departure_city,'') ilike ${qLike} escape '\\'
        or coalesce(o.departure_airport,'') ilike ${qLike} escape '\\'
        or array_to_string(o.tags, ' ') ilike ${qLike} escape '\\'
      )`;
    }

    const rows = await sql`
      select
        o.id,
        o.slug,
        o.title,
        o.destination,
        o.image_url,
        o.category,
        o.tier,
        o.price_from_eur,
        o.duration_days,
        o.persons,
        o.departure_city,
        o.departure_airport,
        o.tags,
        o.meta,
        o.created_at,
        o.updated_at
      from offers o
      where ${where}
      order by ${orderSql}
      limit ${limit};
    `;

    return NextResponse.json(
      {
        ok: true,
        rows,
        meta: { sort, limit },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[api/offers] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
