// app/paiement/succes/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import { Header } from "../../../components/Header/Header";
import styles from "../paiement.module.scss";

import { getStripe } from "../../../lib/stripe";
import { getSql } from "../../../lib/db";

type PageProps = {
  searchParams?: { session_id?: string };
};

export default async function PaiementSuccesPage({ searchParams }: PageProps) {
  const sessionId = searchParams?.session_id;

  // Cas sans session_id : message neutre, sans mention technique
  if (!sessionId) {
    return (
      <>
        <Header showNav={false} showCta={false} />
        <main className="container" style={{ padding: "32px 0" }}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Confirmation</h1>
            <p className={styles.subtitle}>
              Nous finalisons la confirmation de votre demande.
            </p>
          </div>

          <section className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.kicker}>Statut</div>
                <div className={styles.cardTitle}>En cours de validation</div>
                <div className={styles.muted}>
                  Vous recevrez un email dès que tout sera confirmé.
                </div>
              </div>
              <div className={styles.badgeWarn}>En cours</div>
            </div>

            <div className={styles.actions}>
              <Link className={styles.primary} href="/">
                Retour au site
              </Link>
              <a
                className={styles.secondary}
                href="mailto:traveltactik@gmail.com"
              >
                Contacter TravelTactik
              </a>
            </div>
          </section>
        </main>
      </>
    );
  }

  const stripe = getStripe();

  // 1) Vérification côté serveur (sans exposer l'échec au client)
  let session: any = null;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    session = null;
  }

  const isPaid = session?.payment_status === "paid";
  const leadId = session?.metadata?.leadId as string | undefined;

  // 2) Charge le lead depuis Neon (si possible)
  let lead: any = null;
  if (leadId) {
    try {
      const sql = getSql();
      const rows = await sql`
        select
          id,
          email,
          pack,
          speed,
          price_eur,
          brief,
          payment_status,
          paid_at,
          created_at
        from leads
        where id = ${leadId}
        limit 1;
      `;
      lead = rows?.[0] ?? null;
    } catch {
      lead = null;
    }
  }

  const destination =
    lead?.brief?.destination?.trim() || "Destination flexible";
  const durationDays = lead?.brief?.durationDays ?? null;
  const travelers = lead?.brief?.travelers ?? null;
  const budgetMax = lead?.brief?.budgetMax ?? null;

  const pack = lead?.pack ?? session?.metadata?.pack ?? "—";
  const speed = lead?.speed ?? session?.metadata?.speed ?? "—";
  const priceEUR = lead?.price_eur ?? null;

  const ref = lead?.id ?? leadId ?? sessionId;

  // Cas standard attendu : paiement confirmé
  if (isPaid) {
    return (
      <>
        <Header showNav={false} showCta={false} />

        <main className="container" style={{ padding: "32px 0" }}>
          <div className={styles.hero}>
            <h1 className={styles.title}>Paiement confirmé</h1>
            <p className={styles.subtitle}>
              Merci. Votre demande est bien enregistrée. Vous recevrez un email
              de confirmation et la suite du traitement.
            </p>
          </div>

          <section className={styles.card} aria-label="Récapitulatif">
            <div className={styles.cardTop}>
              <div>
                <div className={styles.kicker}>Récapitulatif</div>
                <div className={styles.cardTitle}>{destination}</div>
                <div className={styles.muted}>
                  Référence : <span className={styles.mono}>{ref}</span>
                </div>
              </div>
              <div className={styles.badgeOk}>Confirmé</div>
            </div>

            <div className={styles.grid}>
              <div className={styles.row}>
                <span>Pack</span>
                <strong>{pack}</strong>
              </div>
              <div className={styles.row}>
                <span>Délai</span>
                <strong>{speed}</strong>
              </div>
              <div className={styles.row}>
                <span>Durée</span>
                <strong>{durationDays ? `${durationDays} jours` : "—"}</strong>
              </div>
              <div className={styles.row}>
                <span>Voyageurs</span>
                <strong>{travelers ?? "—"}</strong>
              </div>
              <div className={styles.row}>
                <span>Budget max</span>
                <strong>{budgetMax ? `≤ ${budgetMax}€ / pers` : "—"}</strong>
              </div>
              <div className={styles.row}>
                <span>Total</span>
                <strong>{priceEUR !== null ? `${priceEUR}€` : "—"}</strong>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.next}>
              <h2 className={styles.h2}>Prochaines étapes</h2>
              <ul className={styles.list}>
                <li>Analyse de votre brief et validation des hypothèses.</li>
                <li>
                  Livraison de vos documents (tarifs, descriptif, itinéraire)
                  selon le pack et le délai choisis.
                </li>
                <li>
                  Si nécessaire, vous serez contacté pour une question rapide
                  afin d’affiner le plan.
                </li>
              </ul>

              <p className={styles.tip}>
                Vous pouvez répondre directement à l’email de confirmation pour
                ajouter un détail (dates, aéroports, contraintes, etc.).
              </p>
            </div>

            <div className={styles.actions}>
              <Link className={styles.primary} href="/">
                Retour au site
              </Link>
              <a
                className={styles.secondary}
                href="mailto:traveltactik@gmail.com"
              >
                Assistance
              </a>
            </div>
          </section>
        </main>
      </>
    );
  }

  // Cas “confirmation en cours” : wording e-commerce, sans technique
  return (
    <>
      <Header showNav={false} showCta={false} />

      <main className="container" style={{ padding: "32px 0" }}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Confirmation en cours</h1>
          <p className={styles.subtitle}>
            Votre demande est en cours de validation. Vous recevrez un email dès
            confirmation.
          </p>
        </div>

        <section className={styles.card}>
          <div className={styles.cardTop}>
            <div>
              <div className={styles.kicker}>Statut</div>
              <div className={styles.cardTitle}>En cours de validation</div>
              <div className={styles.muted}>
                Référence : <span className={styles.mono}>{ref}</span>
              </div>
            </div>
            <div className={styles.badgeWarn}>En cours</div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primary} href="/">
              Retour au site
            </Link>
            <a
              className={styles.secondary}
              href="mailto:traveltactik@gmail.com"
            >
              Assistance
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
