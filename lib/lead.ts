import { z } from "zod";

import type { ComfortLevel } from "../components/tripBrief";

export const ServicePackSchema = z.enum(["audit", "itinerary", "concierge"]);
export type ServicePack = z.infer<typeof ServicePackSchema>;

export const DeliverySpeedSchema = z.enum(["standard", "urgent"]);
export type DeliverySpeed = z.infer<typeof DeliverySpeedSchema>;

export const ComfortLevelSchema = z.enum(["eco", "comfort", "premium"]);
export type ComfortLevelZ = z.infer<typeof ComfortLevelSchema>;

// Keep this aligned with components/tripBrief.ts
export const TripBriefSchema = z.object({
  destination: z.string().trim().min(1).max(120),
  durationDays: z.number().int().min(1).max(90),
  travelers: z.number().int().min(1).max(20),
  comfort: ComfortLevelSchema,
  budgetMax: z.number().int().min(1).max(100000),
  avoidLayovers: z.boolean(),
});

export const LeadPayloadSchema = z.object({
  email: z.string().trim().email().max(320),
  notes: z.string().trim().max(4000).default(""),
  pack: ServicePackSchema,
  speed: DeliverySpeedSchema,
  priceEUR: z.number().int().min(0).max(100000),
  brief: TripBriefSchema,
  selectedPlan: ComfortLevelSchema.nullable(),
  createdAt: z.string().datetime(),
});

export type LeadPayload = z.infer<typeof LeadPayloadSchema>;

// Type guard helper when you still need to interop with existing types.
export function assertComfortLevel(_v: ComfortLevel): void {
  // compile-time only
}
