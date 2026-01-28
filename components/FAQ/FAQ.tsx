import styles from "./FAQ.module.scss";

const items = [
  {
    q: "Pourquoi payer alors que les comparateurs de vols existent ? ✈️",
    a: "Parce qu’un comparateur affiche des prix, il ne construit pas un voyage. Il ne te dira pas si un itinéraire te fait perdre du temps, si une escale est pénible, ni quelles alternatives offrent un meilleur confort pour un budget équivalent. TravelTactik fournit un plan cohérent : choix, arbitrages, alternatives et une logique globale (temps + budget + confort).",
  },
  {
    q: "Tu touches une commission sur mes réservations ? 💳",
    a: "Non. Tu réserves toi-même, directement sur les sites officiels. Notre modèle est volontairement simple et transparent : nous vendons une analyse et une sélection (€/dossier), pas des commissions. Aucun intérêt caché : si une option n’est pas pertinente pour toi, nous ne la proposons pas.",
  },
  {
    q: "Et si les prix bougent après ? 📈",
    a: "C’est normal : les prix évoluent en permanence. C’est pour ça que nous fournissons plusieurs options viables, des alternatives et une méthode pour ajuster si un tarif change. Et si tu veux verrouiller un point précis, nous pouvons itérer une fois pour affiner.",
  },
  {
    q: "Quelle est la différence entre Éco / Confort / Premium ? ⚖️",
    a: "Éco : priorité au budget, sans choix absurdes. Confort : équilibre prix / fatigue / fluidité. Premium : priorité au confort et à la réduction maximale des frictions (horaires, escales, logistique). Dans tous les cas, l’objectif reste le même : un voyage clair, cohérent et bien pensé.",
  },
];

export function FAQ() {
  return (
    <section
      id="preuves"
      className={styles.wrap}
      aria-label="Questions fréquentes"
    >
      <h2 className={styles.h2}>FAQ</h2>

      <div className={styles.grid}>
        {items.map((it) => (
          <div key={it.q} className={styles.card}>
            <div className={styles.q}>{it.q}</div>
            <div className={styles.a}>{it.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
