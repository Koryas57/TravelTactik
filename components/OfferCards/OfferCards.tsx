import styles from "./OfferCards.module.scss";
import type { TripBrief } from "../tripBrief";

type Props = {
  brief: TripBrief;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatRangeEUR(center: number) {
  const low = Math.round(center * 0.9);
  const high = Math.round(center * 1.1);
  return `${low}–${high}€`;
}

export function OfferCards({ brief }: Props) {
  const base = clamp(brief.budgetMax, 200, 4000);

  const premiumFactor = brief.avoidLayovers ? 1.12 : 1.05;

  const plans = [
    {
      id: "eco",
      title: "Plan Éco",
      tag: "Maximiser les économies",
      price: formatRangeEUR(base * 0.68),
      bullets: [
        "Vols optimisés (horaires flexibles)",
        "Logement malin (bien noté, bon emplacement)",
        "Itinéraire simple + transports efficaces",
      ],
      accent: "eco",
    },
    {
      id: "comfort",
      title: "Plan Confort",
      tag: "Équilibre budget / confort",
      price: formatRangeEUR(base * 0.86),
      bullets: [
        "Vols avec contraintes réduites",
        "Logement solide (confort + emplacement)",
        "Rythme plus fluide (moins de friction)",
      ],
      accent: "comfort",
    },
    {
      id: "premium",
      title: "Plan Premium",
      tag: brief.avoidLayovers
        ? "Priorité: direct / peu d’escales"
        : "Confort premium",
      price: formatRangeEUR(base * premiumFactor),
      bullets: [
        brief.avoidLayovers
          ? "Priorité vols directs / 1 escale max"
          : "Vols optimisés (confort)",
        "Hébergement haut du panier",
        "Zéro perte de temps (logistique maîtrisée)",
      ],
      accent: "premium",
    },
  ] as const;

  const dest = brief.destination.trim()
    ? brief.destination.trim()
    : "Destination flexible";

  return (
    <section className={styles.wrap} aria-label="Trois plans de voyage">
      <div className={styles.head}>
        <div>
          <h2 className={styles.h2} style={{ margin: 0 }}>
            Tes 3 plans
          </h2>
          <p className={styles.sub} style={{ margin: "6px 0 0" }}>
            {dest} • {brief.durationDays} jours • {brief.travelers} voyageurs •
            Budget ≤ {brief.budgetMax}€ / pers
          </p>
        </div>

        <div className={styles.note}>
          Estimations indicatives • tu réserves toi-même
        </div>
      </div>

      <div className={styles.grid}>
        {plans.map((p) => (
          <article key={p.id} className={`${styles.card} ${styles[p.accent]}`}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.badge}>{p.tag}</div>
                <div className={styles.cardTitle}>{p.title}</div>
              </div>

              <div className={styles.price}>
                <div className={styles.priceLabel}>Objectif</div>
                <div className={styles.priceValue}>{p.price}</div>
                <div className={styles.priceHint}>€/personne</div>
              </div>
            </div>

            <ul className={styles.list}>
              {p.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div className={styles.actions}>
              <a className={styles.primary} href="#brief">
                Choisir ce plan
              </a>
              <a className={styles.secondary} href="#offres">
                Voir détails
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
