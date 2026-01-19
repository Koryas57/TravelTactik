import Link from "next/link";
import styles from "./Legal.module.scss";

export function LegalHeader() {
  return (
    <header className={styles.legalHeader}>
      <div className={styles.legalHeaderInner}>
        <Link href="/" className={styles.brand}>
          TravelTactik
        </Link>

        <nav className={styles.nav} aria-label="Navigation">
          <Link href="/" className={styles.navLink}>
            Accueil
          </Link>
        </nav>
      </div>
    </header>
  );
}
