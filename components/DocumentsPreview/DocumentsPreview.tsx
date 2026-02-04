import Link from "next/link";
import styles from "./DocumentsPreview.module.scss";
import { TravelBookletGallery } from "../TravelBookletGallery/TravelBookletGallery";

const BOOKLETS = [
  {
    id: "polynesie",
    title: "Polynésie",
    subtitle: "Exemple sur 7 jours",
    tag: "Polynésie",
    cover: {
      src: "/images/booklets/PolynesieIpad.png",
      alt: "Couverture Polynésie",
    },
    pages: [
      { src: "/booklets/polynesie/01.jpg", alt: "Polynésie page 1" },
      { src: "/booklets/polynesie/02.jpg", alt: "Polynésie page 2" },
      { src: "/booklets/polynesie/03.jpg", alt: "Polynésie page 3" },
      { src: "/booklets/polynesie/04.jpg", alt: "Polynésie page 4" },
    ],
  },
  {
    id: "newyork",
    title: "New York",
    subtitle: "Exemple pour City-trip",
    tag: "New York",
    cover: { src: "/images/booklets/usaIpad.png", alt: "Couverture New York" },
    pages: [
      { src: "/booklets/newyork/01.jpg", alt: "New York page 1" },
      { src: "/booklets/newyork/02.jpg", alt: "New York page 2" },
      { src: "/booklets/newyork/03.jpg", alt: "New York page 3" },
      { src: "/booklets/newyork/04.jpg", alt: "New York page 4" },
    ],
  },
  {
    id: "lareunion",
    title: "La Réunion",
    subtitle: "Exemple pour Aventure",
    tag: "La Réunion",
    cover: {
      src: "/images/booklets/lareunion.jpg",
      alt: "Couverture La Réunion",
    },
    pages: [
      { src: "/booklets/lareunion/01.jpg", alt: "La Réunion page 1" },
      { src: "/booklets/lareunion/02.jpg", alt: "La Réunion page 2" },
      { src: "/booklets/lareunion/03.jpg", alt: "La Réunion page 3" },
      { src: "/booklets/lareunion/04.jpg", alt: "La Réunion page 4" },
    ],
  },
  {
    id: "barcelone",
    title: "Barcelone",
    subtitle: "Exemple pour City-trip",
    tag: "Barcelone",
    cover: {
      src: "/images/booklets/barcelone.jpg",
      alt: "Couverture Barcelone",
    },
    pages: [
      { src: "/booklets/barcelone/01.jpg", alt: "Barcelone page 1" },
      { src: "/booklets/barcelone/02.jpg", alt: "Barcelone page 2" },
      { src: "/booklets/barcelone/03.jpg", alt: "Barcelone page 3" },
      { src: "/booklets/barcelone/04.jpg", alt: "Barcelone page 4" },
    ],
  },
] as const;

export function DocumentsPreview() {
  return (
    <section className={styles.section} id="documents">
      <div className={styles.head}>
        <div>
          <div className={styles.kicker}>Documents & carnets de voyage</div>
          <h2 className={styles.h2}>Ce que tu obtiens concrètement 💡</h2>
          <p className={styles.p}>
            Travel Tactik te fournit une sélection claire et des liens de
            réservation.
            <strong>
              {" "}
              Tu restes entièrement décisionnaire et tu réserves toi-même{" "}
            </strong>
            sur les sites officiels.
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
              Vols optimisés (prix / horaires / fatigue) selon ton besoin Éco /
              Confort / Premium
            </li>
            <li>Hébergements bien situés et cohérents avec tes priorités</li>
            <li>
              Logique de déplacements réaliste (temps sur place, distances,
              enchaînements)
            </li>
            <li>Options + alternatives : tu choisis, tu arbitres</li>
          </ul>
        </article>

        <article className={styles.card}>
          <div className={styles.priceLine}>
            <div className={styles.price}>49€</div>
            <div className={styles.unit}>en option</div>
          </div>

          <div className={styles.cardTitle}>Carnet de voyage</div>
          <ul className={styles.list}>
            <li>Itinéraire jour par jour (rythme + timing recommandé)</li>
            <li>Incontournables + pépites locales (selon la saison)</li>
            <li>
              Restos, quartiers, spots, expériences : sélection utile, pas du
              remplissage
            </li>
            <li>
              Conseils pratiques (logistique, zones à privilégier, erreurs à
              éviter)
            </li>
          </ul>
        </article>
      </div>

      <div className={styles.note}>
        📓 Livrables accessibles dans ton Espace Client. Tarifs & disponibilités
        tiers susceptibles d’évoluer.
      </div>

      <TravelBookletGallery
        items={[...BOOKLETS]}
        kicker="Exemples de carnets de voyage"
        title="Visualise un carnet (comme tu le recevras) 👇"
        moreHref="/carnets-de-voyage"
        moreLabel="En savoir plus →"
      />
    </section>
  );
}
