import styles from "./AdminHeader.module.scss";

export function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.row}>
          <div className={styles.left}>
            <div className={styles.brand} aria-label="TravelTactik Admin">
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.name}>TravelTactik</span>
              <span className={styles.badge}>Back Office</span>
            </div>
          </div>

          <div className={styles.right}>
            <a className={styles.link} href="/">
              Retour au site
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
