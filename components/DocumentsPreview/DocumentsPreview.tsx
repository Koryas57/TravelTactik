import Link from "next/link";
import styles from "./DocumentsPreview.module.scss";

export function DocumentsPreview() {
  return (
    <section className={styles.section} id="documents">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Documents & Carnets de voyage</div>
          <h2 className={styles.h2}>
            Ce que tu obtiens concrètement &#x1F4A1;
          </h2>
          <p className={styles.p}>
            TravelTactik te fournit une séléction claire et des liens de
            réservation. Tu restes{" "}
            <strong>entièrement décisionnaire et tu réserves toi-même.</strong>
          </p>
        </div>

        <Link className={styles.more} href="/carnets-de-voyage">
          En savoir plus →
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
            <li>
              Vols optimisés intelligemment (prix / horaires / confort selon ton
              besoin)
            </li>
            <li>Hébergements bien situés et cohérents avec tes besoins</li>
            <li>Logique de déplacements fluide et réaliste</li>
            <li>Sélection d’adresses utiles et bons plans pertinents</li>
          </ul>
        </article>

        <article className={styles.card}>
          <div className={styles.priceLine}>
            <div className={styles.price}>49€</div>
            <div className={styles.unit}>en option</div>
          </div>

          <div className={styles.cardTitle}>Carnet de voyage</div>
          <ul className={styles.list}>
            <li>Incontournables et pépites locales du moment</li>
            <li>Bonnes adresses sélectionnées, loin des pièges touristiques</li>
            <li>
              Bons plans premium (Hôtels, Spas, Rooftops, Happy Hours,
              Croisières Apéros)
            </li>
            <li>
              Expériences et timing optimisé : quartiers, spots, moments clés
            </li>
          </ul>
        </article>
      </div>

      <div className={styles.note}>
        &#x1F4D3; Un guide personnalisé pour vivre le voyage au bon endroit, au
        bon moment.
      </div>
    </section>
  );
}
