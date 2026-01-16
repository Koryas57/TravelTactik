"use client";

import { useEffect, useState } from "react";
import { Header } from "../Header/Header";
import { HomeClient } from "../Home/HomeClient";
import { CheckoutDrawer } from "../CheckoutDrawer/CheckoutDrawer";
import type { ComfortLevel, TripBrief } from "../tripBrief";
import { loadState, saveState } from "../storage";

const defaultBrief: TripBrief = {
  destination: "",
  durationDays: 7,
  travelers: 2,
  comfort: "comfort",
  budgetMax: 1500,
  avoidLayovers: false,
};

export function PageClient() {
  const [brief, setBrief] = useState<TripBrief>(defaultBrief);
  const [selectedPlan, setSelectedPlan] = useState<ComfortLevel | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Load on first mount
  useEffect(() => {
    const stored = loadState();
    if (!stored) return;
    setBrief(stored.brief);
    setSelectedPlan(stored.selectedPlan);
  }, []);

  // Save on change
  useEffect(() => {
    saveState({ brief, selectedPlan });
  }, [brief, selectedPlan]);

  function openCheckout() {
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    setCheckoutOpen(false);
  }

  function onSelectPlan(plan: ComfortLevel) {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  }

  return (
    <>
      <Header onCtaClick={openCheckout} />

      <main className="container" style={{ padding: "32px 0" }}>
        <h1 style={{ margin: "18px 0 10px" }}>Même voyage. Meilleur plan.</h1>
        <p style={{ margin: 0, color: "var(--tt-muted)" }}>
          Tu réserves. Je t’aide à optimiser budget, confort et itinéraire.
        </p>

        <HomeClient
          brief={brief}
          onBriefChange={setBrief}
          selectedPlan={selectedPlan}
          onSelectPlan={onSelectPlan}
          onOpenCheckout={openCheckout}
        />
      </main>

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={closeCheckout}
        brief={brief}
        selectedPlan={selectedPlan}
      />
    </>
  );
}
