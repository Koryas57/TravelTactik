"use client";

import Link from "next/link";
import styles from "./Header.module.scss";
import { HeaderAuthActions } from "../Auth/HeaderAuthActions";

type Props = {
  onCtaClick?: () => void;
  showNav?: boolean;
  showCta?: boolean;
  showAuth?: boolean; // NEW
  title?: string;
};

export function Header({
  onCtaClick,
  showCta = true,
  showNav = true,
  showAuth = true,
  title,
}: Props) {
  const ctaLabel = title ?? "Obtenir mon plan";

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="TravelTactik — Accueil"
          >
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.name}>TravelTactik</span>
          </Link>

          {showNav ? (
            <nav className={styles.nav} aria-label="Navigation principale">
              <Link className={styles.link} href="/#brief">
                Brief
              </Link>
              <Link className={styles.link} href="/#scenarios">
                Offres
              </Link>
              <Link className={styles.link} href="/#faq">
                FAQ
              </Link>
            </nav>
          ) : null}

          <div className={styles.actions}>
            {showAuth ? (
              <HeaderAuthActions
                classNameLogin={styles.authLink}
                classNameApp={styles.authLink}
                classNameLogout={styles.authBtn}
              />
            ) : null}

            {showCta ? (
              <button
                type="button"
                className={styles.cta}
                onClick={onCtaClick}
                disabled={!onCtaClick}
                aria-disabled={!onCtaClick}
              >
                {ctaLabel}
              </button>
            ) : (
              <Link className={styles.back} href="/">
                ← Retour au site
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
