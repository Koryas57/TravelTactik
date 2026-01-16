"use client";

import { SearchBox } from "../SearchBox/SearchBox";
import { OfferCards } from "../OfferCards/OfferCards";
import type { TripBrief, ComfortLevel } from "../tripBrief";

type Props = {
  brief: TripBrief;
  onBriefChange: (next: TripBrief) => void;
  selectedPlan: ComfortLevel | null;
  onSelectPlan: (plan: ComfortLevel) => void;
};

export function HomeClient({
  brief,
  onBriefChange,
  selectedPlan,
  onSelectPlan,
}: Props) {
  return (
    <>
      <section id="brief" style={{ marginTop: 28 }}>
        <SearchBox value={brief} onChange={onBriefChange} />
      </section>

      <section id="scenarios" style={{ marginTop: 18 }}>
        <OfferCards
          brief={brief}
          selectedPlan={selectedPlan}
          onSelectPlan={onSelectPlan}
        />
      </section>
    </>
  );
}
