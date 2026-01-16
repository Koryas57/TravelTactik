import styles from "./Header.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <div className={styles.brand} aria-label="Traveltactik">
            <span className={styles.logoDot} aria-hidden="true" />
            <span className={styles.name}>Traveltactik</span>
          </div>

          <nav className={styles.nav} aria-label="Navigation principale">
            <a href="#offres">Offres</a>
            <a href="#preuves">Preuves</a>
            <a href="#cote-bleue">Côte Bleue</a>
            <a href="#brief" className={styles.cta}>
              Obtenir mon plan
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
