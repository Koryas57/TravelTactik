"use client";

import styles from "./Header.module.scss";

type Props = {
  onCtaClick?: () => void;
};

export function Header({ onCtaClick }: Props) {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <div className={styles.brand} aria-label="Traveltactik">
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.name}>Traveltactik</span>
          </div>

          <nav className={styles.nav} aria-label="Navigation principale">
            <a href="#scenarios">Offres</a>
            <a href="#preuves">Preuves</a>
            <a href="#cote-bleue">Côte Bleue</a>

            <button type="button" className={styles.cta} onClick={onCtaClick}>
              Obtenir mon plan
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
