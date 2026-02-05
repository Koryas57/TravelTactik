"use client";

import { useEffect, useState } from "react";
import styles from "./AdminLeads.module.scss";
import Link from "next/link";

type Row = {
  user_id: string;
  email: string;
  name: string | null;
  image: string | null;
  last_seen_at: string;
  quote_id: string | null;
  call_summary: string | null;
  price_eur: number | null;
  payment_status: string | null;
  brief: any;
  quote_created_at: string | null;
  quote_updated_at: string | null;
};

export function AdminQuotesClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/clients", { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        rows?: Row[];
        error?: string;
      };
      if (!res.ok || !data.ok) throw new Error(data.error || "Erreur serveur");
      setRows(data.rows || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="container">
      <div className={styles.top}>
        <div>
          <h1 className={styles.h1}>Admin / Synthèse & Devis</h1>
          <p className={styles.sub}>
            Prépare puis publie les Synthèses & Devis pour les utilisateurs
            ayant un Espace Client.
          </p>
          <p style={{ marginTop: 8 }}>
            <Link href="/admin/leads" style={{ fontWeight: 700 }}>
              Ouvrir Leads & Documents →
            </Link>
          </p>
          <p style={{ marginTop: 8 }}>
            <Link href="/admin/offers" style={{ fontWeight: 700 }}>
              Ouvrir l'éditeur d'offres →
            </Link>
          </p>
        </div>
        <button className={styles.refresh} onClick={load} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
        {rows.map((row) => (
          <QuoteEditor key={row.user_id} row={row} onDone={load} />
        ))}
      </div>
    </main>
  );
}

function QuoteEditor({ row, onDone }: { row: Row; onDone: () => void }) {
  const [destination, setDestination] = useState(row.brief?.destination || "");
  const [callSummary, setCallSummary] = useState(row.call_summary || "");
  const [quoteDetails, setQuoteDetails] = useState(
    row.brief?.quoteDetails || "",
  );
  const [priceEUR, setPriceEUR] = useState(String(row.price_eur || 0));
  const [durationDays, setDurationDays] = useState(
    String(row.brief?.durationDays || 7),
  );
  const [travelers, setTravelers] = useState(String(row.brief?.travelers || 2));
  const [budgetMax, setBudgetMax] = useState(
    String(row.brief?.budgetMax || row.price_eur || 0),
  );
  const [saving, setSaving] = useState(false);

  async function save(publish: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: row.user_id,
          email: row.email,
          destination,
          callSummary,
          quoteDetails,
          priceEUR: Math.max(0, Math.trunc(Number(priceEUR) || 0)),
          durationDays: Math.max(1, Math.trunc(Number(durationDays) || 1)),
          travelers: Math.max(1, Math.trunc(Number(travelers) || 1)),
          budgetMax: Math.max(0, Math.trunc(Number(budgetMax) || 0)),
          publish,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Erreur sauvegarde");
      await onDone();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article
      style={{
        borderRadius: 14,
        background: "linear-gradient(91deg, #00038d52, #874d4d08)",
        padding: 14,
        display: "grid",
        gap: 10,
        boxShadow: "-2px 0 6px 0px #000000a3",
        margin: "3vh auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong>{row.name || "Utilisateur"}</strong> —{" "}
          <span>{row.email}</span>
          <div className={styles.muted}>
            Dernière activité : {new Date(row.last_seen_at).toLocaleString()} ·
            Statut devis : {row.brief?.status || "—"}
            {row.payment_status ? ` · Paiement: ${row.payment_status}` : ""}
          </div>
        </div>
      </div>

      <label>
        Destination :
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{
            width: "max-content",
            margin: "1vh",
            borderRadius: "10px",
            border: "1px solid transparent",
            padding: "3px",
          }}
        />
      </label>

      <label>
        Synthèse de l&apos;appel :
        <textarea
          value={callSummary}
          onChange={(e) => setCallSummary(e.target.value)}
          rows={15}
          style={{
            width: "100%",
            margin: "1vh auto",
            borderRadius: "10px",
            border: "1px solid transparent",
            padding: "3px",
          }}
        />
      </label>

      <label>
        Détails du devis :
        <textarea
          value={quoteDetails}
          onChange={(e) => setQuoteDetails(e.target.value)}
          rows={15}
          style={{
            width: "100%",
            margin: "1vh auto",
            borderRadius: "10px",
            border: "1px solid transparent",
            padding: "3px",
          }}
        />
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "nowrap",
          flexDirection: "row-reverse",
        }}
      >
        <label>
          Prix en €
          <input
            value={priceEUR}
            onChange={(e) => setPriceEUR(e.target.value)}
            type="number"
            min={0}
            style={{
              width: "50px",
              margin: "1vh",
              borderRadius: "10px",
              border: "1px solid transparent",
              padding: "3px",
              textAlign: "center",
            }}
          />
        </label>
        <label>
          Durée
          <input
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            type="number"
            min={1}
            style={{
              width: "30px",
              margin: "1vh",
              borderRadius: "10px",
              border: "1px solid transparent",
              padding: "3px",
              textAlign: "center",
            }}
          />
        </label>
        <label>
          Voyageurs
          <input
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
            type="number"
            min={1}
            style={{
              width: "30px",
              margin: "1vh",
              borderRadius: "10px",
              border: "1px solid transparent",
              padding: "3px",
              textAlign: "center",
            }}
          />
        </label>
        <label>
          Budget max en €
          <input
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            type="number"
            min={0}
            style={{
              width: "50px",
              margin: "1vh",
              borderRadius: "10px",
              border: "1px solid transparent",
              padding: "3px",
              textAlign: "center",
            }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          className={styles.smallBtn}
          type="button"
          onClick={() => save(false)}
          disabled={saving}
        >
          {saving ? "..." : "Sauver en brouillon"}
        </button>
        <button
          className={styles.smallBtn}
          type="button"
          onClick={() => save(true)}
          disabled={saving}
        >
          {saving ? "..." : "Publier dans l'espace client"}
        </button>
      </div>
    </article>
  );
}
