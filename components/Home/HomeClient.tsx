"use client";

import { useState } from "react";
import { SearchBox } from "../SearchBox/SearchBox";
import { OfferCards } from "../OfferCards/OfferCards";
import type { TripBrief } from "../tripBrief";

const initialBrief: TripBrief = {
  destination: "",
  durationDays: 7,
  travelers: 2,
  comfort: "comfort",
  budgetMax: 1500,
  avoidLayovers: false,
};

export function HomeClient() {
  const [brief, setBrief] = useState<TripBrief>(initialBrief);

  return (
    <>
      <section id="brief" style={{ marginTop: 28 }}>
        <SearchBox value={brief} onChange={setBrief} />
      </section>

      <section id="scenarios" style={{ marginTop: 18 }}>
        <OfferCards brief={brief} />
      </section>
    </>
  );
}
