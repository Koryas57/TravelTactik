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
        <div>
          <h2 className={styles.h2}>Les offres du moment</h2>
          <p className={styles.p}>
            Planifiez avec nous votre prochain voyage à des prix imbattables !
            Les prix indiqués comprennent le vol et l&apos;hébergement.
          </p>
        </div>

        <Link className={styles.more} href="/offres">
          Voir toutes les offres →
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
