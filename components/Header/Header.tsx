"use client";

import Link from "next/link";
import Image from "next/image";
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
  const ctaLabel = title ?? "Appel gratuit";

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="TravelTactik — Accueil"
          >
            <Image
              className={styles.brandLogoImage}
              src="/images/LogoTravel.png"
              alt="Logo TravelTactik"
              width={44}
              height={55}
            />

            <span className={styles.brandText}>TRAVEL TACTIK</span>
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
                ← Accueil
              </Link>
            )}

            <HeaderMenu openCheckout={onCtaClick} />
          </div>
        </div>
      </div>
    </header>
  );
}
