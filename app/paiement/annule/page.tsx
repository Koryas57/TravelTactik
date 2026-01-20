// app/paiement/annule/page.tsx
import Link from "next/link";
import { Header } from "../../../components/Header/Header";
import styles from "../paiement.module.scss";

type PageProps = {
  searchParams?: { lead_id?: string };
};

export default function PaiementAnnulePage({ searchParams }: PageProps) {
  const leadId = searchParams?.lead_id;

  return (
    <>
      <Header showNav={false} showCta={false} />

      <main className="container" style={{ padding: "32px 0" }}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Paiement annulé</h1>
          <p className={styles.subtitle}>
            Votre demande n’a pas été validée car le paiement a été annulé.
          </p>
        </div>

        <section className={styles.card}>
          <div className={styles.cardTop}>
            <div>
              <div className={styles.kicker}>Statut</div>
              <div className={styles.cardTitle}>Annulé</div>
              {leadId ? (
                <div className={styles.muted}>
                  Référence : <span className={styles.mono}>{leadId}</span>
                </div>
              ) : null}
            </div>

            <div className={styles.badgeWarn}>Annulé</div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primary} href="/">
              Retour au site
            </Link>
            <a className={styles.secondary} href="/#brief">
              Reprendre ma demande
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
