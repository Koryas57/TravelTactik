import styles from "./AboutSection.module.scss";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9A3.5 3.5 0 0 0 20 16.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.25 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M14 3v10.1a3.9 3.9 0 1 1-3.2-3.84V6.1a7 7 0 1 0 5.2 6.75V8.2c1.2.86 2.6 1.38 4 1.5V7.3c-2.1-.2-3.8-1.8-4-4.3H14Z" />
  </svg>
);

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5A3 3 0 0 0 2.4 7.2 31.3 31.3 0 0 0 2 12a31.3 31.3 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 22 12a31.3 31.3 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6h1.6V4.8c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5V11H7v3h3.2v8h3.3Z" />
  </svg>
);

export function AboutSection() {
  return (
    <section className={styles.section} id="traveltactik">
      <div className={styles.card}>
        <div className={styles.kicker}>
          <img
            src="/images/LogoTravel.png"
            width="44"
            height={55}
            alt="Logo Travel Tactik"
          />
          Travel Tactik
        </div>
        <h2 className={styles.h2}>Conseil en organisation de voyages</h2>

        <p className={styles.p}>
          Voyager coûte souvent cher pour une raison simple : on réserve vite,
          sans arbitrage, et on paye des erreurs (horaires, fatigue, mauvais
          emplacement). Travel Tactik construit un plan cohérent{" "}
          <strong>(temps + budget + confort)</strong> grâce à une méthode de
          recherche, des alternatives, et un cadrage clair sans que tu aies à y
          passer des heures.
        </p>

        <div className={styles.notice}>
          Travel Tactik conseille uniquement : tu restes le seul à réserver tes
          billets et tes prestations.
          <br />
          <strong>
            {" "}
            Aucune commission n’est perçue sur tes réservations
          </strong>{" "}
          : la rémunération provient uniquement de la prestation de conseil.
          <br />
          Résultat : un plan indépendant, pensé pour te faire gagner du temps et
          éviter les mauvais choix.
        </div>

        <div className={styles.social}>
          <a
            className={styles.icon}
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
          >
            <InstagramIcon className={`${styles.svg} ${styles.ig}`} />
          </a>

          <a
            className={styles.icon}
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            title="TikTok"
          >
            <TikTokIcon className={`${styles.svg} ${styles.tt}`} />
          </a>

          <a
            className={styles.icon}
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            title="YouTube"
          >
            <YouTubeIcon className={`${styles.svg} ${styles.yt}`} />
          </a>

          <a
            className={styles.icon}
            href="#"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            title="Facebook"
          >
            <FacebookIcon className={`${styles.svg} ${styles.fb}`} />
          </a>
        </div>
      </div>
    </section>
  );
}
