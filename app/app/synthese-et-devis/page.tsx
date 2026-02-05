import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { getSql } from "../../../lib/db";
import styles from "../plans/Plans.module.scss";
import { QuoteCard } from "../../../components/Plans/QuoteCard";

type LeadRow = {
  id: string;
  brief: any;
  notes: string | null;
  price_eur: number;
  payment_status: string | null;
};

export default async function SyntheseEtDevisPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) return null;

  const sql = getSql();

  await sql`
    delete from leads
    where lower(email) = ${email}
      and payment_status <> 'paid'
      and brief ? 'status'
      and brief->>'status' = 'published'
      and brief ? 'expiresAt'
      and (brief->>'expiresAt')::timestamptz < now();
  `;

  const rows = (await sql`
    select id, brief, notes, price_eur, payment_status
    from leads
    where lower(email) = ${email}
      and payment_status <> 'paid'
      and brief ? 'status'
      and brief->>'status' = 'published'
    order by created_at desc
    limit 1;
  `) as LeadRow[];

  const quote = rows[0] || null;

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.h1}>Synthèse et Devis 📃</h1>
          <p className={styles.sub}>
            Retrouve ici le résumé de ton appel et valide ton devis en ligne.
          </p>
        </div>
      </div>

      {!quote ? (
        <div className={styles.empty}>
          <p className={styles.muted}>
            Aucune synthèse ni devis publiés pour le moment. Ton conseiller
            publiera ici après l&apos;appel.
          </p>
          <Link className={styles.primaryLink} href="/app">
            Retourner à mon Espace Client
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          <QuoteCard
            leadId={quote.id}
            destination={quote.brief?.destination || "Destination flexible"}
            callSummary={quote.notes || ""}
            quoteDetails={quote.brief?.quoteDetails || ""}
            priceEUR={quote.price_eur}
            expiresAt={quote.brief?.expiresAt || null}
            status="DEVIS EN COURS"
          />
        </div>
      )}
    </div>
  );
}
