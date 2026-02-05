import styles from "./PlanCard.module.scss";

type DocType = "tarifs" | "carnet";
type LeadDoc = {
  doc_type: DocType;
  status: "pending" | "ready";
  url: string | null;
};

type Props = {
  id: string;
  destination: string;
  durationDays: number | string;
  travelers: number | string;
  budgetMax: number | string;
  pack: string;
  speed: string;
  priceEUR: number;
  paymentStatus: string | null;
  documents: LeadDoc[];
};

const DOCS: DocType[] = ["tarifs", "carnet"];

const DOC_LABELS: Record<DocType, string> = {
  tarifs: "PDF Tarifs",
  carnet: "Carnet de voyage",
};

function toDocMap(documents: LeadDoc[]) {
  const m = new Map<DocType, LeadDoc>();
  for (const d of documents || []) {
    if (d?.doc_type) m.set(d.doc_type, d);
  }
  return m;
}

export function PlanCard(props: Props) {
  const isPaid = props.paymentStatus === "Paiement reçu";
  const docMap = toDocMap(props.documents);

  const bgClass =
    props.pack === "concierge"
      ? styles.bgPremium
      : props.pack === "itinerary"
        ? styles.bgComfort
        : styles.bgEco;

  return (
    <article className={styles.card}>
      <div className={`${styles.media} ${bgClass}`}>
        <div className={styles.mediaOverlay} />
        <div className={styles.mediaTop}>
          <div className={styles.destination}>{props.destination}</div>
          <span className={styles.badge}>{props.paymentStatus || "—"}</span>
        </div>

        <div className={styles.mediaBottom}>
          <div className={styles.kpis}>
            <span>{props.durationDays} jours</span>
            <span>·</span>
            <span>{props.travelers} voyageurs</span>
            <span>·</span>
            <span>≤ {props.budgetMax}€ / pers</span>
          </div>
          <div className={styles.packLine}>
            Pack <strong>{props.pack}</strong> · Délai{" "}
            <strong>{props.speed}</strong> · <strong>{props.priceEUR}€</strong>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.sectionTitle}>Documents</div>

        {!isPaid ? (
          <div className={styles.note}>
            Paiement requis pour débloquer les documents.
          </div>
        ) : null}

        <div className={styles.docs}>
          {DOCS.map((t) => {
            const d = docMap.get(t) || null;
            const ready = Boolean(d?.status === "ready" && d?.url);

            return (
              <div key={t} className={styles.docRow}>
                <div className={styles.docLeft}>
                  <div className={styles.docLabel}>{DOC_LABELS[t]}</div>
                  <div className={styles.docStatus}>
                    {ready ? "Disponible" : "À venir"}
                  </div>
                </div>

                <div className={styles.docRight}>
                  {isPaid && ready ? (
                    <a
                      className={styles.smallBtn}
                      href={`/api/app/documents/${props.id}/${t}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ouvrir
                    </a>
                  ) : (
                    <span className={styles.muted}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
