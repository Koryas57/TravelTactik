// app/api/offers/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSql } from "../../../lib/db";

type Tier = "eco" | "comfort" | "premium";

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

function cleanLike(s: string) {
  // évite les %/_ non voulus
  return s.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function GET(req: NextRequest) {
  try {
    const sql = getSql();

    const sp = req.nextUrl.searchParams;

    const category = sp.get("category");
    const from = sp.get("from");
    const to = sp.get("to");
    const q = sp.get("q");
    const tier = sp.get("tier");
    const maxPriceRaw = sp.get("maxPrice");
    const limitRaw = sp.get("limit");

    const limit = Math.max(
      1,
      Math.min(200, Number.parseInt(limitRaw || "60", 10) || 60),
    );

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

    // Patterns (ILIKE)
    const qLike = q ? `%${cleanLike(q.trim())}%` : null;
    const fromLike = from ? `%${cleanLike(from.trim())}%` : null;
    const toLike = to ? `%${cleanLike(to.trim())}%` : null;

    const rows = await sql`
      with tiers as (
        select
          ot.offer_id,
          jsonb_agg(
            jsonb_build_object(
              'tier', ot.tier,
              'from_price_eur', ot.from_price_eur,
              'currency', ot.currency,
              'summary', ot.summary,
              'details', ot.details
            )
            order by case ot.tier
              when 'eco' then 1
              when 'comfort' then 2
              else 3
            end
          ) as tiers_json,
          min(ot.from_price_eur) as min_price_eur
        from offer_tiers ot
        group by ot.offer_id
      )
      select
        o.id,
        o.slug,
        o.title,
        o.destination,
        o.image_url,
        o.duration_days,
        o.tags,
        o.meta,
        o.category,
        o.departure_city,
        o.arrival_city,
        o.teaser,
        o.highlights,
        o.is_active,
        o.published_at,
        coalesce(t.tiers_json, '[]'::jsonb) as tiers,
        t.min_price_eur
      from offers o
      left join tiers t on t.offer_id = o.id
      where
        o.is_active = true
        and (o.published_at is null or o.published_at <= now())

        and (${category}::text is null or o.category = ${category})

        and (
          ${fromLike}::text is null
          or coalesce(o.departure_city,'') ilike ${fromLike} escape '\\'
        )

        and (
          ${toLike}::text is null
          or coalesce(o.arrival_city, o.destination, '') ilike ${toLike} escape '\\'
        )

        and (
          ${qLike}::text is null
          or o.title ilike ${qLike} escape '\\'
          or coalesce(o.destination,'') ilike ${qLike} escape '\\'
          or coalesce(o.departure_city,'') ilike ${qLike} escape '\\'
          or coalesce(o.arrival_city,'') ilike ${qLike} escape '\\'
          or array_to_string(o.tags, ' ') ilike ${qLike} escape '\\'
        )

        and (
          ${tier}::text is null
          or exists (
            select 1
            from offer_tiers ot
            where ot.offer_id = o.id
              and ot.tier = ${tier}
          )
        )

        and (
          ${maxPrice}::int is null
          or (
            select min(ot2.from_price_eur)
            from offer_tiers ot2
            where ot2.offer_id = o.id
          ) <= ${maxPrice}
        )

      order by
        coalesce(o.published_at, o.created_at) desc
      limit ${limit};
    `;

    return NextResponse.json({ ok: true, rows }, { status: 200 });
  } catch (err) {
    console.error("[api/offers] error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 },
    );
  }
}
