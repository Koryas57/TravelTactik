"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./OffersPreviewFromOffres.module.scss";
import { OfferCard, type Offer } from "../Offers/OfferCard";

async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// A preview of recent offers from the /offres page on the landing page.

export function OffersPreviewFromOffres() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/offers?sort=recent&limit=12", {
          cache: "no-store",
        });

        const data = await safeJson<{ ok: boolean; rows?: Offer[] }>(res);
        if (!mounted) return;

        if (!res.ok || !data?.ok) {
          setOffers([]);
          return;
        }

        setOffers(data.rows || []);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className={styles.section} id="offres">
      <div className={styles.head}>
        <div className={styles.subdiv}>
          <h2 className={styles.h2}>
            Des voyages pensés intelligemment &#x2705;
          </h2>
          <p className={styles.p}>
            Chaque voyage présenté ici est le résultat d'une{" "}
            <strong>analyse complète</strong> : optimisation des vols,
            hébérgements, niveau de confort et coût réel.
          </p>

          <p className={styles.p}>
            <strong>
              Les prix affichés correspondent à une estimation au moment de la
              recherche (vol + hébergement).
            </strong>
          </p>
          <p className={styles.p}>
            <strong>Les disponibilités et tarifs peuvent évoluer.</strong>
          </p>
        </div>

        <Link className={styles.more} href="/offres">
          Explorer les plans disponibles →
        </Link>
      </div>

      {loading ? <div className={styles.muted}>Chargement…</div> : null}

      <div className={styles.scroller}>
        {offers.map((o) => (
          <div key={o.id} className={styles.item}>
            <OfferCard offer={o} showFavorite={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
