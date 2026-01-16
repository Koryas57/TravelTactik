export type ComfortLevel = "eco" | "comfort" | "premium";

export type TripBrief = {
  destination: string;
  durationDays: number;
  travelers: number;
  comfort: ComfortLevel;
  budgetMax: number; // €/personne
  avoidLayovers: boolean;
};

export const comfortLabels: Record<ComfortLevel, string> = {
  eco: "Éco",
  comfort: "Confort",
  premium: "Premium",
};
