"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Offers.module.scss";

import { OfferCard } from "../../components/Offers/OfferCard";

type Tier = "eco" | "comfort" | "premium";
type Sort = "recent" | "price_asc" | "price_desc";

const CATEGORIES = [
  "Aventure",
  "Découverte Culturelle",
  "CityTrip",
  "Ski",
  "Calme Absolu",
  "Plage & Détente",
  "Montagne & Treks",
  "En famille",
  "En couple",
  "En solo",
  "Experiences/Evenements",
  "Week-end",
  "Mois Entier",
] as const;

type Category = (typeof CATEGORIES)[number];

type Offer = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  image_url: string | null;

  category: Category | null;
  tier: Tier | null;

  price_from_eur: number | null;
  duration_days: number | null;
  persons: number | null;

  departure_city: string | null;
  departure_airport: string | null;

  tags: string[];
  meta: any;

  created_at: string;
  updated_at: string;
};

function isTier(v: string | null): v is Tier {
  return v === "eco" || v === "comfort" || v === "premium";
}
function isSort(v: string | null): v is Sort {
  return v === "recent" || v === "price_asc" || v === "price_desc";
}
function isCategory(v: string | null): v is Category {
  return Boolean(v) && (CATEGORIES as readonly string[]).includes(v as string);
}

function buildQS(input: {
  q?: string;
  from?: string;
  to?: string;
  category?: string;
  tier?: string;
  maxPrice?: string;
  sort?: string;
  limit?: number;
}) {
  const p = new URLSearchParams();

  const q = (input.q || "").trim();
  const from = (input.from || "").trim();
  const to = (input.to || "").trim();
  const category = (input.category || "").trim();
  const tier = (input.tier || "").trim();
  const maxPrice = (input.maxPrice || "").trim();
  const sort = (input.sort || "").trim();
  const limit = input.limit ?? 60;

  if (q) p.set("q", q);
  if (from) p.set("from", from);
  if (to) p.set("to", to);

  if (category) p.set("category", category);
  if (tier) p.set("tier", tier);
  if (maxPrice) p.set("maxPrice", maxPrice);
  if (sort) p.set("sort", sort);

  p.set("limit", String(limit));
  return p.toString();
}

/**
 * Parse JSON uniquement si le Content-Type est JSON.
 * Retourne null si réponse non-JSON (HTML, redirect, empty, etc.).
 */
async function safeJson<T>(res: Response): Promise<T | null> {
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function OffersClient() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtres (pilotés par l’URL)
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState<string>(""); // "" = all
  const [tier, setTier] = useState<string>(""); // "" = all
  const [maxPrice, setMaxPrice] = useState<string>(""); // "" = no limit
  const [sort, setSort] = useState<Sort>("recent");

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "/offres";
    return window.location.pathname + window.location.search;
  }, []);

  // 1) Au mount: hydrate depuis querystring
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);

    const q0 = sp.get("q") || "";
    const from0 = sp.get("from") || "";
    const to0 = sp.get("to") || "";

    const cat0 = sp.get("category");
    const tier0 = sp.get("tier");
    const max0 = sp.get("maxPrice") || "";
    const sort0 = sp.get("sort");

    setQ(q0);
    setFrom(from0);
    setTo(to0);

    setCategory(isCategory(cat0) ? cat0 : "");
    setTier(isTier(tier0) ? tier0 : "");
    setMaxPrice(max0);

    setSort(isSort(sort0) ? sort0 : "recent");
  }, []);

  // 2) Quand filtres changent: pousse dans l’URL
  const qs = useMemo(() => {
    return buildQS({
      q,
      from,
      to,
      category,
      tier,
      maxPrice,
      sort,
      limit: 100,
    });
  }, [q, from, to, category, tier, maxPrice, sort]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextUrl = qs ? `/offres?${qs}` : "/offres";
    window.history.replaceState(null, "", nextUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/offers?${qs}`, {
        cache: "no-store",
        redirect: "follow",
      });

      const data = await safeJson<{
        ok: boolean;
        rows?: Offer[];
        error?: string;
      }>(res);

      if (!res.ok || !data?.ok) {
        const msg =
          data?.error ||
          `Erreur serveur (offers): ${res.status} ${res.statusText}`;
        throw new Error(msg);
      }

      setOffers(data.rows || []);

      const favRes = await fetch("/api/app/favorites", {
        cache: "no-store",
        redirect: "manual",
      });

      if (
        favRes.status === 401 ||
        favRes.status === 302 ||
        favRes.status === 307 ||
        favRes.status === 308
      ) {
        setFavIds(new Set());
      } else {
        const favData = await safeJson<{
          ok: boolean;
          ids?: string[];
          error?: string;
        }>(favRes);

        if (favRes.ok && favData?.ok) setFavIds(new Set(favData.ids || []));
        else setFavIds(new Set());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qs]);

  async function toggleFavorite(offerId: string) {
    setBusyId(offerId);
    try {
      const res = await fetch("/api/app/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
        redirect: "manual",
      });

      if (
        res.status === 401 ||
        res.status === 302 ||
        res.status === 307 ||
        res.status === 308
      ) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(
          currentUrl,
        )}`;
        return;
      }

      const data = await safeJson<{
        ok: boolean;
        liked?: boolean;
        error?: string;
      }>(res);

      if (!data) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(
          currentUrl,
        )}`;
        return;
      }

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

  function setQuickCategory(next: string) {
    setCategory((prev) => (prev === next ? "" : next));
  }

  function setQuickTier(next: Tier) {
    setTier((prev) => (prev === next ? "" : next));
  }

  const resetAll = () => {
    setQ("");
    setFrom("");
    setTo("");
    setCategory("");
    setTier("");
    setMaxPrice("");
    setSort("recent");
  };

  const chipsLabel =
    category || tier
      ? `${category ? `Catégorie : ${category}` : ""}${category && tier ? " • " : ""}${
          tier
            ? `Gamme : ${tier === "eco" ? "Éco" : tier === "comfort" ? "Confort" : "Premium"}`
            : ""
        }`
      : "Aucun filtre rapide sélectionné";

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.h1}>Nos Offres Sélectionnées ⭐</h1>

          <div className={styles.stats}>
            <span className={styles.statPill}>
              {loading ? "…" : offers.length} offre
              {offers.length > 1 ? "s" : ""}
            </span>
            <span className={styles.statNote}>{chipsLabel}</span>
          </div>
        </div>

        <p className={styles.sub}>
          Filtre nos meilleurs offres par départ, destination, mots-clés, puis
          sauvegarde tes favoris.
        </p>
      </div>

      <div className={styles.toolbar}>
        {/* Inputs : 2 lignes premium */}
        <div className={styles.searchGrid}>
          <label className={styles.field}>
            <span>Départ</span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Marseille, Paris, CDG…"
            />
          </label>

          <label className={styles.field}>
            <span>Destination</span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Bangkok, Lisbonne…"
            />
          </label>

          <label className={styles.fieldWide}>
            <span>Mots-clés</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ski, week-end, Tokyo, rooftop, nature…"
            />
          </label>

          <label className={styles.field}>
            <span>Max €</span>
            <input
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              inputMode="numeric"
              placeholder="ex: 800"
            />
          </label>

          <label className={styles.field}>
            <span>Trier</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
            >
              <option value="recent">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.chips}>
        <div className={styles.chipsGroup}>
          <div className={styles.chipsTitle}>Catégories</div>

          <div className={styles.chipsRail}>
            <div
              className={styles.chipsRow}
              role="list"
              aria-label="Catégories"
            >
              <button
                type="button"
                className={`${styles.chip} ${category === "" ? styles.chipOn : ""}`}
                onClick={() => setCategory("")}
                aria-pressed={category === ""}
                role="listitem"
              >
                Toutes
              </button>

              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.chip} ${category === c ? styles.chipOn : ""}`}
                  onClick={() => setQuickCategory(c)}
                  aria-pressed={category === c}
                  role="listitem"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.chipsGroup}>
          <div className={styles.chipsTitle}>Gamme</div>

          <div className={styles.chipsRail}>
            <div className={styles.chipsRow} role="list" aria-label="Gamme">
              {(["eco", "comfort", "premium"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${tier === t ? styles.chipOn : ""}`}
                  onClick={() => setQuickTier(t)}
                  aria-pressed={tier === t}
                  role="listitem"
                >
                  {t === "eco"
                    ? "Éco"
                    : t === "comfort"
                      ? "Confort"
                      : "Premium"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {error ? <div className={styles.error}>{error}</div> : null}
      {loading ? <div className={styles.muted}>Chargement…</div> : null}

      <div className={styles.grid}>
        {!loading && !offers.length ? (
          <div className={styles.empty}>
            Aucune offre ne correspond à ces filtres. Essaie d’élargir la
            recherche.
          </div>
        ) : null}

        {offers.map((o) => {
          const liked = favIds.has(o.id);
          const busy = busyId === o.id;

          return (
            <OfferCard
              key={o.id}
              offer={o}
              liked={liked}
              busy={busy}
              onToggleFavorite={toggleFavorite}
              showFavorite={true}
            />
          );
        })}
      </div>
    </div>
  );
}
