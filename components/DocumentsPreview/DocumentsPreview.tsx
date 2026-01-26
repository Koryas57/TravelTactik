import Link from "next/link";
import styles from "./DocumentsPreview.module.scss";

export function DocumentsPreview() {
  return (
    <section className={styles.section} id="documents">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Documents & Carnets de voyage</div>
          <h2 className={styles.h2}>Le livrable qui change tout</h2>
          <p className={styles.p}>
            Une synthèse claire, actionnable, et optimisée pour ton budget et
            ton confort.
          </p>
        </div>

        <Link className={styles.more} href="/carnets-de-voyage">
          Voir plus →
        </Link>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.priceLine}>
            <div className={styles.price}>20€</div>
            <div className={styles.unit}>/ jour de voyage</div>
          </div>

          <div className={styles.cardTitle}>Conseil & organisation</div>
          <ul className={styles.list}>
            <li>Vols optimisés (prix / horaires / confort selon ton niveau)</li>
            <li>Hébergements avantageux et bien connectés</li>
            <li>Logique de déplacements et cohérence géographique</li>
            <li>Sélection d’adresses et bons plans utiles</li>
          </ul>
        </article>

        <article className={styles.card}>
          <div className={styles.priceLine}>
            <div className={styles.price}>49€</div>
            <div className={styles.unit}>option</div>
          </div>

          <div className={styles.cardTitle}>Carnet de voyage</div>
          <ul className={styles.list}>
            <li>Incontournables + pépites du moment</li>
            <li>Bonnes adresses et “secrets” locaux</li>
            <li>Bons plans premium (ex : hôtels, spas, happy hours)</li>
            <li>Expériences : croisières, spots, quartiers, timing</li>
          </ul>
        </article>
      </div>

      <div className={styles.note}>
        TravelTactik te donne une sélection claire et des liens de réservation.
        Tu restes décisionnaire et tu réserves toi-même.
      </div>
    </section>
  );
}
