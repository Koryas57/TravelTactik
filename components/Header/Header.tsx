"use client";

import Link from "next/link";
import styles from "./Header.module.scss";
import { HeaderMenu } from "./HeaderMenu";

type Props = {
  onCtaClick?: () => void;
  showCta?: boolean;
  showNav?: boolean; // gardé pour compat, mais on ne l’utilise plus
  showAuth?: boolean; // gardé pour compat (auth est dans le menu)
  title?: string;
};

export function Header({ onCtaClick, showCta = true, title }: Props) {
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

          <div className={styles.actions}>
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

            <HeaderMenu openCheckout={onCtaClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
