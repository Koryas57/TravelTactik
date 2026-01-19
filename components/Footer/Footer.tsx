import Link from "next/link";
import styles from "./Footer.module.scss";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.colBrand}>
          <div className={styles.logo}>TravelTactik</div>
          <p className={styles.tagline}>
            Conseils de voyage sur-mesure : stratégie, optimisation,
            itinéraires.
          </p>
        </div>

        <div className={styles.col}>
          <div className={styles.title}>Liens</div>
          <div className={styles.links}>
            <Link href="/#brief">Brief</Link>
            <Link href="/#offres">Offres</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.title}>Légal</div>
          <div className={styles.links}>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© {year} TravelTactik</span>
          <span className={styles.sep}>•</span>
          <span>
            Ce site ne vend pas de billets : il propose un service de conseil.
          </span>
        </div>
      </div>
    </footer>
  );
}
