"use client";

import { SearchBox } from "../SearchBox/SearchBox";
import { OfferCards } from "../OfferCards/OfferCards";
import { PromoStrip } from "../PromoStrip/PromoStrip";
import { OfferDetails } from "../OfferDetails/OfferDetails";
import { FAQ } from "../FAQ/FAQ";
import type { TripBrief, ComfortLevel } from "../tripBrief";
import HeroBreak from "../TravelTactikHeroBreak.webp";

type Props = {
  brief: TripBrief;
  onBriefChange: (brief: TripBrief) => void;
  selectedPlan: ComfortLevel | null;
  onSelectPlan: (plan: ComfortLevel) => void;
  onOpenCheckout: () => void;
};

export function HomeClient({
  brief,
  onBriefChange,
  selectedPlan,
  onSelectPlan,
  onOpenCheckout,
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

      {/* Séparateur "voyage" (image + copy) */}
      <PromoStrip
        imageSrc="/images/TravelTactikHeroBreak.webp"
        title="Des bons plans, mais surtout une bonne méthode"
        subtitle="3 stratégies + une check-list simple pour réserver vite, éviter les pièges, et optimiser budget / temps / confort."
      />

      {/* Anchor cible des liens "Voir détails" */}
      <section id="offres" style={{ marginTop: 18 }}>
        <OfferDetails
          brief={brief}
          selectedPlan={selectedPlan}
          onCta={onOpenCheckout}
        />
      </section>

      <section id="faq" style={{ marginTop: 18 }}>
        <FAQ />
      </section>
    </>
  );
}
