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

  useEffect(() => {
    const stored = loadState();
    if (!stored) return;
    setBrief(stored.brief);
    setSelectedPlan(stored.selectedPlan);
  }, []);

  useEffect(() => {
    saveState({ brief, selectedPlan });
  }, [brief, selectedPlan]);

  function openCheckout() {
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    setCheckoutOpen(false);
  }

  return (
    <>
      <Header onCtaClick={openCheckout} title="Appel découverte gratuit" />

      <main className="container" style={{ padding: "32px 0" }}>
        <HomeClient />
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
