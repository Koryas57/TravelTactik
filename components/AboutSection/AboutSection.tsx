import styles from "./AboutSection.module.scss";

export function AboutSection() {
  return (
    <section className={styles.section} id="traveltactik">
      <div className={styles.card}>
        <div className={styles.kicker}>TravelTactik</div>
        <h2 className={styles.h2}>Agence de conseil en voyage</h2>

        <p className={styles.p}>
          TravelTactik conçoit des itinéraires et des sélections de transports /
          hébergements optimisées, avec des bons plans utiles et des adresses
          pertinentes, selon ton budget et ton niveau de confort.
        </p>

        <div className={styles.notice}>
          TravelTactik conseille uniquement : tu restes le seul à réserver tes
          billets et tes prestations. Aucune commission n’est perçue sur tes
          réservations. La rémunération provient de la formule de conseil.
        </div>

        <div className={styles.social}>
          <a
            className={styles.icon}
            href="#"
            aria-label="Instagram"
            title="Instagram"
          >
            <span className={styles.ig} />
          </a>
          <a
            className={styles.icon}
            href="#"
            aria-label="TikTok"
            title="TikTok"
          >
            <span className={styles.tt} />
          </a>
          <a
            className={styles.icon}
            href="#"
            aria-label="YouTube"
            title="YouTube"
          >
            <span className={styles.yt} />
          </a>
          <a
            className={styles.icon}
            href="#"
            aria-label="Facebook"
            title="Facebook"
          >
            <span className={styles.fb} />
          </a>
        </div>

        <div className={styles.socialHint}>
          Remplace les “#” par tes URLs réelles.
        </div>
      </div>
    </section>
  );
}
