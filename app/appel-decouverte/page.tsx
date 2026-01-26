import { CalendlyEmbed } from "../../components/CalendlyEmbed/CalendlyEmbed";
import styles from "./page.module.scss";

export default function AppelDecouvertePage() {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "";

  return (
    <main className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.h1}>Réserve ton appel découverte</h1>
        <p className={styles.lead}>
          15–30 minutes pour cadrer destination, dates, budget, niveau (Éco /
          Confort / Premium) et priorités.
        </p>
      </header>

      <section className={styles.grid}>
        <div className={styles.left}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Choisis un créneau</div>
            <CalendlyEmbed url={calendlyUrl} height={740} />
          </div>
        </div>

        <aside className={styles.right}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Prépare l’appel</div>

            <ul className={styles.bullets}>
              <li>Destination(s) envisagée(s) + alternatives possibles</li>
              <li>Dates / flexibilité</li>
              <li>Budget (repère) et niveau souhaité</li>
              <li>Contraintes (rythme, escales, activités indispensables)</li>
            </ul>

            <div className={styles.note}>
              Après réservation, tu reçois automatiquement la confirmation et
              l’invitation calendrier.
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Ou laisse un message</div>
            {/* Formulaire simple (optionnel) -> tu pourras brancher /api/lead plus tard */}
            <form className={styles.form}>
              <label className={styles.label}>
                Email*
                <input
                  className={styles.input}
                  type="email"
                  placeholder="toi@email.com"
                  required
                />
              </label>

              <label className={styles.label}>
                Téléphone (optionnel)
                <input className={styles.input} type="tel" placeholder="+33…" />
              </label>

              <label className={styles.label}>
                Ta demande*
                <textarea className={styles.textarea} rows={6} required />
              </label>

              <button className={styles.btn} type="submit" disabled>
                Envoyer (à brancher)
              </button>

              <div className={styles.formHint}>
                Pour l’instant, concentre-toi sur l’appel (c’est ce qui
                convertit le mieux).
              </div>
            </form>
          </div>
        </aside>
      </section>
    </main>
  );
}
