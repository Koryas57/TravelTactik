import styles from "./FAQ.module.scss";

const items = [
  {
    q: "Pourquoi payer alors que les comparateurs de vols existent ?",
    a: "Parce que la plupart des gens réservent vite, mal, et surpayent. Ici tu as une stratégie: choix, arbitrages, alternatives, et surtout un plan cohérent (temps + budget + confort).",
  },
  {
    q: "Tu touches une commission sur mes réservations ?",
    a: "Non. Tu réserves toi-même. Mon modèle est transparent: je vends mon expertise (€/dossier).",
  },
  {
    q: "Si les prix bougent ?",
    a: "Je fournis des alternatives et une méthode de recherche. On peut aussi itérer une fois si tu veux verrouiller un détail.",
  },
  {
    q: "C’est quoi la différence entre Éco / Confort / Premium ?",
    a: "Éco = priorité au budget. Confort = compromis prix/temps. Premium = priorité au confort et à la réduction des frictions (escales, logistique).",
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
