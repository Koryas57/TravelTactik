import Link from "next/link";
import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>TravelTactik</div>
          <div className={styles.tagline}>
            Conseils de voyage sur-mesure : stratégie, optimisation,
            itinéraires.
          </div>
        </div>

        <nav className={styles.links} aria-label="Liens de bas de page">
          <Link className={styles.link} href="/mentions-legales">
            Mentions légales
          </Link>
          <Link className={styles.link} href="/confidentialite">
            Politique de confidentialité
          </Link>
          <a className={styles.link} href="mailto:traveltactik@gmail.com">
            Contact
          </a>
        </nav>

        <div className={styles.meta}>
          <div>© {new Date().getFullYear()} TravelTactik</div>
          <div className={styles.small}>
            Ce site ne vend pas de billets : il propose un service de conseil.
          </div>
        </div>
      </div>
    </footer>
  );
}
