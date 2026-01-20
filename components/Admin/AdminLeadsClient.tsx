"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AdminLeads.module.scss";

type LeadRow = {
  id: string;
  email: string;
  pack: string;
  speed: string;
  price_eur: number;
  brief: any;
  payment_status: string | null;
  created_at: string;
  paid_at: string | null;
  handled: boolean;
  handled_at: string | null;
};

export function AdminLeadsClient() {
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(""); // "" | paid | pending
  const [handled, setHandled] = useState<string>(""); // "" | true | false

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (handled) p.set("handled", handled);
    p.set("limit", "100");
    return p.toString();
  }, [status, handled]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/leads?${qs}`, { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        rows?: LeadRow[];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  async function toggleHandled(id: string) {
    try {
      setActionId(id);
      setError(null);

      const res = await fetch(`/api/admin/leads/${id}/handled`, {
        method: "POST",
        cache: "no-store",
      });

      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) throw new Error(data.error || "Erreur serveur");

      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(msg);
      alert(msg);
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="container" style={{ padding: "28px 0" }}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.h1}>Admin — Leads</h1>
          <p className={styles.sub}>
            Liste des demandes + statut paiement + traitement.
          </p>
        </div>

        <button className={styles.refresh} onClick={load} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      <div className={styles.filters}>
        <label className={styles.filter}>
          <span>Paiement</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>

        <label className={styles.filter}>
          <span>Traité</span>
          <select value={handled} onChange={(e) => setHandled(e.target.value)}>
            <option value="">Tous</option>
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </label>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Email</th>
              <th>Destination</th>
              <th>Pack</th>
              <th>Speed</th>
              <th>Prix</th>
              <th>Paiement</th>
              <th>Traité</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const destination = r.brief?.destination || "Flexible";
              const isActing = actionId === r.id;
              const btnLabel = r.handled ? "Annuler traité" : "Marquer traité";

              return (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td className={styles.mono}>{r.email}</td>
                  <td>{destination}</td>
                  <td>{r.pack}</td>
                  <td>{r.speed}</td>
                  <td>{r.price_eur}€</td>
                  <td>{r.payment_status || "—"}</td>
                  <td>{r.handled ? "Oui" : "Non"}</td>
                  <td>
                    <button
                      className={styles.smallBtn}
                      onClick={() => toggleHandled(r.id)}
                      disabled={isActing}
                      title={
                        r.handled
                          ? "Repasser en non traité"
                          : "Marquer comme traité"
                      }
                    >
                      {isActing ? "..." : btnLabel}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!rows.length && !loading ? (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  Aucun résultat.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
