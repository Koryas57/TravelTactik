"use client";

import styles from "./OfferDetails.module.scss";
import type { ComfortLevel, TripBrief } from "../tripBrief";
import { comfortLabels } from "../tripBrief";

type Props = {
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
  onCta: () => void;
};

function planCopy(plan: ComfortLevel) {
  if (plan === "eco") {
    return {
      title: "Plan Éco — maximiser les économies",
      bullets: [
        "Stratégie vols: jours/heures optimisés + alternatives",
        "Hébergements bien notés au meilleur ratio prix/emplacement",
        "Itinéraire simple (peu de déplacements, peu de friction)",
        "Conseils anti-pièges (transports, change, quartiers)",
      ],
      deliverables: [
        "2–3 options vols (ou méthode exacte si prix volatile)",
        "2 options logement + zones recommandées",
        "Checklist: transport, budget, pièges, réservations",
      ],
    };
  }

  if (plan === "premium") {
    return {
      title: "Plan Premium — confort & zéro perte de temps",
      bullets: [
        "Priorité vols directs / escales minimales",
        "Hébergement haut du panier (emplacement + confort)",
        "Logistique fluide: transferts, timing, planning optimisé",
        "Options de backup (si annulation / hausse de prix)",
      ],
      deliverables: [
        "Sélection vols orientée confort + contraintes réduites",
        "Shortlist hébergements premium + recommandations",
        "Plan logistique complet + alternatives",
      ],
    };
  }

  return {
    title: "Plan Confort — équilibre budget / confort",
    bullets: [
      "Vols avec contraintes réduites (sans exploser le budget)",
      "Logement solide (bon confort + bon emplacement)",
      "Rythme fluide: moins de temps perdu, mieux réparti",
      "Recommandations concrètes (quartiers, transport, rythme)",
    ],
    deliverables: [
      "Vols: sélection optimisée (prix/temps)",
      "Logement: 2 options + zones",
      "Mini-itinéraire (structure + conseils)",
    ],
  };
}

export function OfferDetails({ brief, selectedPlan, onCta }: Props) {
  const plan: ComfortLevel = selectedPlan ?? "comfort";
  const copy = planCopy(plan);

  const dest = brief.destination.trim()
    ? brief.destination.trim()
    : "Destination flexible";

  return (
    <section
      id="offres"
      className={styles.wrap}
      aria-label="Détails des offres"
    >
      <div className={styles.head}>
        <div>
          <h2 className={styles.h2}>Détails</h2>
          <p className={styles.sub}>
            {dest} • {brief.durationDays} jours • {brief.travelers} voyageurs •{" "}
            <strong>{comfortLabels[plan]}</strong>
          </p>
        </div>

        <button className={styles.cta} type="button" onClick={onCta}>
          Obtenir mon plan
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.titleRow}>
          <div className={styles.cardTitle}>{copy.title}</div>
          <div className={styles.pill}>Livrable concret</div>
        </div>

        <div className={styles.cols}>
          <div>
            <div className={styles.blockTitle}>Ce que tu gagnes</div>
            <ul className={styles.list}>
              {copy.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className={styles.blockTitle}>Ce que je livre</div>
            <ul className={styles.list}>
              {copy.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <div className={styles.note}>
              Important : tu réserves toi-même. Mon job = te donner une
              stratégie claire et des choix solides, plus vite et mieux que
              “Booking/Skyscanner au hasard”.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
