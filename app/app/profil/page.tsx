import { getServerSession } from "next-auth";
import styles from "./page.module.scss";
import { authOptions } from "../../../auth";

export const metadata = {
  title: "Mon profil — TravelTactik",
};

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Mon profil voyageur</h1>
          <p>
            Aide-nous à préparer un voyage fluide et serein : ces infos restent
            privées et servent à anticiper tes besoins.
          </p>
        </header>

        <section className={styles.card}>
          <h2>Informations personnelles</h2>
          <div className={styles.row}>
            <div>
              <span className={styles.label}>Email :</span>
              <div className={styles.value}>{session?.user?.email ?? "—"}</div>
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Préférences de voyage</h2>
          <form className={styles.form} action="/api/profile" method="post">
            <div className={styles.field}>
              <label htmlFor="favoriteAirport">Aéroport préféré</label>
              <input
                id="favoriteAirport"
                name="favoriteAirport"
                type="text"
                placeholder="Ex: Paris CDG, Lyon, Bruxelles"
              />
            </div>

            <fieldset className={styles.fieldset}>
              <legend>Modes de transport possibles</legend>
              <label className={styles.checkbox}>
                <input name="transportModes" value="voiture" type="checkbox" />
                Voiture personnelle
              </label>
              <label className={styles.checkbox}>
                <input name="transportModes" value="bus" type="checkbox" />
                Bus / autocar
              </label>
              <label className={styles.checkbox}>
                <input name="transportModes" value="train" type="checkbox" />
                Train
              </label>
              <label className={styles.checkbox}>
                <input name="transportModes" value="avion" type="checkbox" />
                Avion
              </label>
              <label className={styles.checkbox}>
                <input name="transportModes" value="bateau" type="checkbox" />
                Bateau
              </label>
            </fieldset>

            <div className={styles.field}>
              <label htmlFor="specificities">
                Spécificités à connaître (handicaps, phobie, baignade
                impossible, etc.)
              </label>
              <textarea
                id="specificities"
                name="specificities"
                rows={5}
                placeholder="Ex: Fauteuil roulant, peur de la foule, allergies..."
              />
            </div>

            <button className={styles.primary} type="submit">
              Enregistrer mon profil
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
