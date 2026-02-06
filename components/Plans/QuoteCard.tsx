"use client";

import { useState } from "react";
import styles from "./PlanCard.module.scss";

type Props = {
  leadId: string;
  destination: string;
  callSummary: string;
  quoteDetails: string;
  priceEUR: number;
  expiresAt: string | null;
  status: string;
};

export function QuoteCard({
  leadId,
  destination,
  callSummary,
  quoteDetails,
  priceEUR,
  expiresAt,
  status,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [acceptedCgv, setAcceptedCgv] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.url)
        throw new Error(data.error || "Paiement indisponible");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de paiement");
      setLoading(false);
    }
  }

  return (
    <article className={styles.card}>
      <div className={`${styles.media} ${styles.bgComfort}`}>
        <div className={styles.mediaOverlay} />
        <div className={styles.mediaTop}>
          <div className={styles.destination}>Synthèse et Devis</div>
          <span className={styles.badge}>{status}</span>
        </div>
        <div className={styles.mediaBottom}>
          <div className={styles.kpis}>{destination}</div>
          <div className={styles.packLine}>
            Devis en cours · <strong>{priceEUR}€</strong>
            {expiresAt
              ? ` · Expire le ${new Date(expiresAt).toLocaleDateString()}`
              : ""}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.sectionTitle}>Synthèse d&apos;appel</div>
        <div className={styles.note}>{callSummary}</div>

        <div className={styles.sectionTitle}>Détails du devis</div>
        <div className={styles.note}>{quoteDetails}</div>

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginTop: 10,
          }}
        >
          <input
            type="checkbox"
            checked={acceptedCgv}
            onChange={(e) => setAcceptedCgv(e.target.checked)}
          />
          <span>J&apos;accepte les Conditions Générales de Vente (CGV).</span>
        </label>

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginTop: 10,
          }}
        >
          <input
            type="checkbox"
            checked={acceptedLegal}
            onChange={(e) => setAcceptedLegal(e.target.checked)}
          />
          <span>
            Je demande l&apos;exécution immédiate de la prestation et je renonce
            à mon droit de rétractation.
          </span>
        </label>

        <button
          type="button"
          className={styles.payBtn}
          onClick={pay}
          disabled={!acceptedCgv || !acceptedLegal || loading}
          style={{ marginTop: 12 }}
        >
          {loading ? "Redirection..." : "J'accepte le devis / Payer"}
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}
      </div>
    </article>
  );
}
