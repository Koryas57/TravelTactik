export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSql } from "../../../../../lib/db";

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

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v,
  );
}

export async function PATCH(
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

  const body = (await req.json()) as Record<string, unknown>;

  // Champs autorisés
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const destination =
    typeof body.destination === "string" ? body.destination.trim() : undefined;
  const category =
    typeof body.category === "string" ? body.category.trim() : undefined;

  if (category && category.length > 0 && !ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { ok: false, error: "Invalid category" },
      { status: 400 },
    );
  }

  const departureCity =
    typeof body.departure_city === "string"
      ? body.departure_city.trim()
      : undefined;
  const arrivalCity =
    typeof body.arrival_city === "string"
      ? body.arrival_city.trim()
      : undefined;

  const imageUrl =
    typeof body.image_url === "string" ? body.image_url.trim() : undefined;
  const teaser =
    typeof body.teaser === "string" ? body.teaser.trim() : undefined;

  const isActive =
    typeof body.is_active === "boolean" ? body.is_active : undefined;

  const durationDays =
    typeof body.duration_days === "number" && body.duration_days >= 1
      ? Math.floor(body.duration_days)
      : undefined;

  const tags = Array.isArray(body.tags)
    ? (body.tags.filter((t) => typeof t === "string") as string[])
    : undefined;

  const meta =
    typeof body.meta === "object" && body.meta !== null ? body.meta : undefined;

  const publishedAt =
    typeof body.published_at === "string" && body.published_at.trim()
      ? new Date(body.published_at).toISOString()
      : body.published_at === null
        ? null
        : undefined;

  const sql = getSql();

  const rows = await sql`
    update offers
    set
      title = coalesce(${title ?? null}, title),
      destination = coalesce(${destination ?? null}, destination),
      category = ${category === undefined ? sql`category` : category || null},
      departure_city = ${departureCity === undefined ? sql`departure_city` : departureCity || null},
      arrival_city = ${arrivalCity === undefined ? sql`arrival_city` : arrivalCity || null},
      image_url = ${imageUrl === undefined ? sql`image_url` : imageUrl || null},
      teaser = ${teaser === undefined ? sql`teaser` : teaser || null},
      duration_days = coalesce(${durationDays ?? null}, duration_days),
      is_active = coalesce(${isActive ?? null}, is_active),
      published_at = ${
        publishedAt === undefined ? sql`published_at` : (publishedAt as any)
      }::timestamptz,
      tags = coalesce(${tags ?? null}::text[], tags),
      meta = coalesce(${meta ?? null}::jsonb, meta),
      updated_at = now()
    where id = ${id}::uuid
    returning *;
  `;

  const offer = rows?.[0];
  if (!offer) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, offer }, { status: 200 });
}
