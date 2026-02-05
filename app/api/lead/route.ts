// app/api/lead/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { ComfortLevel, TripBrief } from "../../../components/tripBrief";

import { getSql } from "../../../lib/db";
import { sendLeadEmails } from "../../../lib/mailer";

type ServicePack = "audit" | "itinerary" | "concierge";
type DeliverySpeed = "standard" | "urgent";

type LeadPayload = {
  email: string;
  notes: string;
  pack: ServicePack;
  speed: DeliverySpeed;
  priceEUR: number;
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
  createdAt: string;

  // anti-abus
  hp?: string; // honeypot (doit être vide)
  ts?: number; // timestamp ouverture drawer (ms epoch)
  page?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPack(v: string): v is ServicePack {
  return v === "audit" || v === "itinerary" || v === "concierge";
}

function isSpeed(v: string): v is DeliverySpeed {
  return v === "standard" || v === "urgent";
}

function isComfortLevelOrNull(v: unknown): v is ComfortLevel | null {
  return v === null || v === "eco" || v === "comfort" || v === "premium";
}

// Petit helper: timeout sur une promise (évite les hangs)
async function withTimeout<T>(
  p: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let t: NodeJS.Timeout | undefined;

  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(
      () => reject(new Error(`Timeout after ${ms}ms (${label})`)),
      ms,
    );
  });

  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

// Normalise une date ISO côté serveur (et fail si invalide)
function parseClientDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid createdAt");
  return d.toISOString();
}

// IP côté Vercel (x-forwarded-for)
function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "0.0.0.0";
}

/**
 * Rate limit MVP (en mémoire).
 * Limitation: en serverless, c'est "best effort" (par instance). Suffisant pour MVP.
 */
type Bucket = { count: number; resetAt: number };
const RL_WINDOW_MS = 10 * 60 * 1000; // 10 min
const RL_MAX_PER_IP = 12; // 12 requêtes / 10 min / IP
const RL_MAX_PER_EMAIL = 6; // 6 requêtes / 10 min / email (anti-spam ciblé)

const ipBuckets = new Map<string, Bucket>();
const emailBuckets = new Map<string, Bucket>();

function hitBucket(
  map: Map<string, Bucket>,
  key: string,
  max: number,
): boolean {
  const now = Date.now();
  const b = map.get(key);

  if (!b || now > b.resetAt) {
    map.set(key, { count: 1, resetAt: now + RL_WINDOW_MS });
    return true;
  }

  if (b.count >= max) return false;
  b.count += 1;
  map.set(key, b);
  return true;
}

// Validation “humain” basique: le form doit être ouvert depuis au moins X ms
function validateHumanTiming(ts?: number) {
  if (!ts || typeof ts !== "number") throw new Error("Missing form timestamp");
  const now = Date.now();
  const age = now - ts;

  // Trop rapide -> bot probable
  if (age < 1200) throw new Error("Too fast");

  // Trop vieux -> payload obsolète / replay
  if (age > 2 * 60 * 60 * 1000) throw new Error("Expired form");
}

export async function POST(req: Request) {
  let body: LeadPayload;

  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 },
    );
  }

  // Honeypot (si rempli => bot)
  if (body.hp && String(body.hp).trim().length > 0) {
    // Réponse neutre pour ne pas aider un bot
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Timing anti-bot
  try {
    validateHumanTiming(body.ts);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid timing";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // Rate limit
  const ip = getClientIp(req);
  const emailLower = (body.email || "").toLowerCase().trim();

  if (!hitBucket(ipBuckets, ip, RL_MAX_PER_IP)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests (ip)" },
      { status: 429 },
    );
  }
  if (emailLower && !hitBucket(emailBuckets, emailLower, RL_MAX_PER_EMAIL)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests (email)" },
      { status: 429 },
    );
  }

  // Validation minimale MVP (+ quelques gardes anti-abus)
  if (!isEmail(emailLower) || emailLower.length > 254) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 },
    );
  }
  if (!isPack(body.pack)) {
    return NextResponse.json(
      { ok: false, error: "Invalid pack" },
      { status: 400 },
    );
  }
  if (!isSpeed(body.speed)) {
    return NextResponse.json(
      { ok: false, error: "Invalid speed" },
      { status: 400 },
    );
  }
  if (!isComfortLevelOrNull(body.selectedPlan)) {
    return NextResponse.json(
      { ok: false, error: "Invalid plan" },
      { status: 400 },
    );
  }
  if (!body.brief || typeof body.brief !== "object") {
    return NextResponse.json(
      { ok: false, error: "Invalid brief" },
      { status: 400 },
    );
  }

  const notes = (body.notes ?? "").toString();
  if (notes.length > 5000) {
    return NextResponse.json(
      { ok: false, error: "Notes too long" },
      { status: 400 },
    );
  }

  const ua = req.headers.get("user-agent") ?? null;

  // Log utile (avant DB)
  console.log("[Traveltactik] Lead received:", {
    ip,
    email: emailLower,
    pack: body.pack,
    speed: body.speed,
    priceEUR: body.priceEUR,
    selectedPlan: body.selectedPlan,
    destination: body.brief?.destination,
    createdAt: body.createdAt,
    page: body.page,
  });

  try {
    const sql = getSql();
    const createdAtISO = parseClientDate(body.createdAt);

    // Déduplication courte (évite double clic / refresh / spam léger)
    // Critère: même email + pack + destination, dans les 5 dernières minutes.
    const dest = String(body.brief?.destination ?? "").trim();

    const dedupeRows = await sql`
      select id
      from leads
      where email = ${emailLower}
        and pack = ${body.pack}
        and (brief->>'destination') = ${dest}
        and client_created_at > (now() - interval '5 minutes')
      order by client_created_at desc
      limit 1;
    `;

    const existingId = dedupeRows?.[0]?.id;
    if (existingId) {
      console.log("[Traveltactik] deduped lead:", { existingId });
      return NextResponse.json(
        { ok: true, leadId: existingId, deduped: true },
        { status: 200 },
      );
    }

    // INSERT + retour de l'id
    const rows = await sql`
      insert into leads (
        email,
        notes,
        pack,
        speed,
        price_eur,
        brief,
        selected_plan,
        client_created_at,
        user_agent
      )
      values (
        ${emailLower},
        ${notes},
        ${body.pack},
        ${body.speed},
        ${body.priceEUR},
        ${JSON.stringify(body.brief)}::jsonb,
        ${body.selectedPlan},
        ${createdAtISO}::timestamptz,
        ${ua}
      )
      returning id;
    `;

    const leadId = rows?.[0]?.id;
    if (!leadId) throw new Error("Insert failed (no id returned)");

    console.log("[Traveltactik] Lead inserted:", { leadId });

    // Emails: UNIQUEMENT depuis le formulaire /appel-decouverte
    const fromContactForm = body.page === "/appel-decouverte";

    if (fromContactForm) {
      const emailResult = await withTimeout(
        sendLeadEmails(String(leadId), { ...body, email: emailLower, notes }),
        15000,
        "sendLeadEmails",
      );

      console.log("[Traveltactik] sendLeadEmails OK", { leadId, emailResult });
    } else {
      console.log("[Traveltactik] sendLeadEmails skipped (non-contact flow)", {
        leadId,
        page: body.page,
      });
    }

    return NextResponse.json({ ok: true, leadId }, { status: 200 });
  } catch (err) {
    console.error("[Traveltactik] /api/lead error:", err);

    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Server error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
