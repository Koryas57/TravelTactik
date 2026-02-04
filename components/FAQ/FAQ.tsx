import styles from "./FAQ.module.scss";

const items = [
  {
    q: "Pourquoi payer alors que les comparateurs de vols existent ? ✈️",
    a: "Un comparateur affiche des prix, mais il ne construit pas un voyage. Il ne te dira pas si un itinéraire te fait perdre du temps, si une escale est pénible, ni quelles alternatives offrent un meilleur confort pour un budget proche. Travel Tactik te donne un plan cohérent : choix, arbitrages, options + alternatives (temps + budget + confort).",
  },
  {
    q: "Tu touches une commission sur mes réservations ? 💳",
    a: "Non. Tu réserves toi-même, directement sur les sites officiels. Travel Tactik vend une prestation de conseil (analyse + sélection), pas des commissions. Aucun intérêt caché : si une option n’est pas pertinente pour toi, elle ne sera pas proposée.",
  },
  {
    q: "Et si les prix bougent après ? 📈",
    a: "C’est normal : vols et hébergements évoluent en permanence. Les prix communiqués correspondent à un instant T. Pour limiter les mauvaises surprises, tu reçois plusieurs options viables et des alternatives. Si un point clé change (prix/stock), une itération est possible pour ajuster dans le périmètre initial.",
  },
  {
    q: "Quelle est la différence entre Éco / Confort / Premium ? ⚖️",
    a: "Éco : priorité au budget, sans choix absurdes. Confort : équilibre prix / fatigue / fluidité. Premium : priorité au confort et à la réduction maximale des frictions (horaires, escales, logistique). Objectif commun : un voyage clair, cohérent, et adapté à toi.",
  },
  {
    q: "Quand est-ce que je reçois le devis et les documents ? ⏱️",
    a: "En pratique : devis sous ~3 jours ouvrés après réception d’un brief complet. Après paiement, le PDF “Tarifs & Liens” est généralement mis à disposition sous moins de 24 h. Le Carnet de voyage (option) est généralement livré sous ~3 jours ouvrés après stabilisation des choix.",
  },
  {
    q: "Remboursement / droit de rétractation : comment ça marche ? 🧾",
    a: "La prestation est personnalisée et délivrée rapidement (mise à disposition de documents numériques). Une fois le livrable accessible dans ton Espace Client, la prestation est considérée comme exécutée. Les modalités exactes (rétractation, exceptions, exécution immédiate) sont précisées dans les CGV au moment du paiement.",
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
