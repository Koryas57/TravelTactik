"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Offers.module.scss";

type Offer = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  image_url: string | null;
  price_from_eur: number | null;
  duration_days: number | null;
  tags: string[];
  meta: any;
};

export function OffersClient() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "/offres";
    return window.location.pathname + window.location.search;
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/offers?limit=100", { cache: "no-store" });
      const data = (await res.json()) as { ok: boolean; rows?: Offer[] };
      if (res.ok && data.ok) setOffers(data.rows || []);

      // favoris (si 401 -> ignore)
      const favRes = await fetch("/api/app/favorites", { cache: "no-store" });
      if (favRes.status === 401) {
        setFavIds(new Set());
      } else {
        const favData = (await favRes.json()) as {
          ok: boolean;
          ids?: string[];
        };
        if (favRes.ok && favData.ok) setFavIds(new Set(favData.ids || []));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggle(offerId: string) {
    setBusyId(offerId);
    try {
      const res = await fetch("/api/app/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });

      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
        return;
      }

      const data = (await res.json()) as { ok: boolean; liked?: boolean };
      if (!res.ok || !data.ok) return;

      setFavIds((prev) => {
        const next = new Set(prev);
        if (next.has(offerId)) next.delete(offerId);
        else next.add(offerId);
        return next;
      });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <div className={styles.muted}>Chargement…</div>;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Offres de voyages</h1>
        <p className={styles.sub}>
          Des idées “type” que tu peux enregistrer en favoris.
        </p>
      </div>

      <div className={styles.grid}>
        {offers.map((o) => {
          const liked = favIds.has(o.id);
          const busy = busyId === o.id;

          return (
            <article key={o.id} className={styles.card}>
              <div className={styles.media}>
                {/* image_url optionnelle : on garde un fallback “premium” */}
                <div
                  className={styles.bg}
                  style={
                    o.image_url
                      ? { backgroundImage: `url(${o.image_url})` }
                      : undefined
                  }
                />
                <button
                  type="button"
                  className={`${styles.heart} ${liked ? styles.heartOn : ""}`}
                  onClick={() => toggle(o.id)}
                  disabled={busy}
                  aria-label={
                    liked ? "Retirer des favoris" : "Ajouter aux favoris"
                  }
                  title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  ♥
                </button>
              </div>

              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <strong className={styles.title}>{o.title}</strong>
                  <span className={styles.destination}>{o.destination}</span>
                </div>

                <div className={styles.meta}>
                  {o.duration_days
                    ? `${o.duration_days} jours`
                    : "Durée flexible"}
                  {" · "}
                  {typeof o.price_from_eur === "number"
                    ? `dès ${o.price_from_eur}€`
                    : "Budget variable"}
                </div>

                {o.tags?.length ? (
                  <div className={styles.tags}>
                    {o.tags.slice(0, 4).map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
