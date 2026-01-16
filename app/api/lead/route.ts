import { NextResponse } from "next/server";
import type { ComfortLevel, TripBrief } from "../../../components/tripBrief";

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

export async function POST(req: Request) {
  let body: LeadPayload;

  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!isEmail(body.email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email" },
      { status: 400 }
    );
  }
  if (!isPack(body.pack)) {
    return NextResponse.json(
      { ok: false, error: "Invalid pack" },
      { status: 400 }
    );
  }
  if (!isSpeed(body.speed)) {
    return NextResponse.json(
      { ok: false, error: "Invalid speed" },
      { status: 400 }
    );
  }
  if (!isComfortLevelOrNull(body.selectedPlan)) {
    return NextResponse.json(
      { ok: false, error: "Invalid plan" },
      { status: 400 }
    );
  }

  // MVP: on log côté serveur (dans Vercel: logs de fonctions)
  console.log("[Traveltactik] Lead received:", {
    email: body.email,
    pack: body.pack,
    speed: body.speed,
    priceEUR: body.priceEUR,
    selectedPlan: body.selectedPlan,
    destination: body.brief?.destination,
    durationDays: body.brief?.durationDays,
    travelers: body.brief?.travelers,
    budgetMax: body.brief?.budgetMax,
    avoidLayovers: body.brief?.avoidLayovers,
    createdAt: body.createdAt,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
