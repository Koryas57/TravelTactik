import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth";
import { getSql } from "../../../lib/db";
import styles from "./Plans.module.scss";
import { PlanCard } from "../../../components/Plans/PlanCard";

type DocType = "tarifs" | "descriptif" | "carnet";

type LeadDoc = {
  doc_type: DocType;
  status: "pending" | "ready";
  url: string | null;
};

type LeadRow = {
  id: string;
  brief: any;
  pack: string;
  speed: string;
  price_eur: number;
  payment_status: string | null;
  created_at: string;
  paid_at: string | null;
  documents: LeadDoc[];
};

const DOC_LABELS: Record<DocType, string> = {
  tarifs: "PDF Tarifs",
  descriptif: "PDF Descriptif",
  carnet: "Carnet de voyage",
};

export default async function PlansPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) return null;

  const sql = getSql();

  // Paid en premier, puis récent.
  // On agrège les documents en JSON pour éviter N requêtes.
  const rows = (await sql`
    select
      l.id,
      l.brief,
      l.pack,
      l.speed,
      l.price_eur,
      l.payment_status,
      l.created_at,
      l.paid_at,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'doc_type', d.doc_type,
            'status', d.status,
            'url', d.url
          )
          order by d.doc_type asc
        ) filter (where d.id is not null),
        '[]'::jsonb
      ) as documents
    from leads l
    left join lead_documents d on d.lead_id = l.id
    where lower(l.email) = ${email}
    group by l.id
    order by (l.payment_status = 'paid') desc, l.created_at desc
    limit 50;
  `) as LeadRow[];

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.h1}>Mes plans de voyage</h1>
          <br />
          <p className={styles.sub}>
            Retrouve ici tes demandes, leurs statut, ainsi que tes documents et
            ton carnet de voyage.
          </p>
          <br />
        </div>
      </div>

      {!rows?.length ? (
        <div className={styles.empty}>
          <p className={styles.muted}>
            Aucun plan pour l’instant. Tu peux en créer un depuis l’accueil.
          </p>
          <a className={styles.primaryLink} href="/">
            Retour à l’accueil
          </a>
        </div>
      ) : (
        <div className={styles.grid}>
          {rows.map((r) => {
            const destination = r.brief?.destination || "Destination flexible";
            const durationDays = r.brief?.durationDays ?? "—";
            const travelers = r.brief?.travelers ?? "—";
            const budgetMax = r.brief?.budgetMax ?? "—";

            return (
              <PlanCard
                key={r.id}
                id={r.id}
                destination={destination}
                durationDays={durationDays}
                travelers={travelers}
                budgetMax={budgetMax}
                pack={r.pack}
                speed={r.speed}
                priceEUR={r.price_eur}
                paymentStatus={r.payment_status}
                documents={(r.documents || []) as any}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
