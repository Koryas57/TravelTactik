"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Offers.module.scss";

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

  // 2) Quand filtres changent: pousse dans l’URL + reload data
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
      const res = await fetch(`/api/offers?${qs}`, { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        rows?: Offer[];
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erreur serveur");
      }

      setOffers(data.rows || []);

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

  function setQuickCategory(next: string) {
    setCategory((prev) => (prev === next ? "" : next));
  }

  function setQuickTier(next: Tier) {
    setTier((prev) => (prev === next ? "" : next));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h1 className={styles.h1}>Offres premium</h1>
        <p className={styles.sub}>
          Recherche, filtres, et favoris. Les cartes sont administrées dans le
          back-office.
        </p>
      </div>

      {/* Toolbar / Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <label className={styles.field}>
            <span>Départ</span>
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Marseille, Paris, LYS…"
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

          <label className={styles.field}>
            <span>Recherche</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="mots-clés (ski, week-end, Tokyo…)"
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
              <option value="recent">Récent</option>
              <option value="price_asc">Prix ↑</option>
              <option value="price_desc">Prix ↓</option>
            </select>
          </label>

          <button
            type="button"
            className={styles.reset}
            onClick={() => {
              setQ("");
              setFrom("");
              setTo("");
              setCategory("");
              setTier("");
              setMaxPrice("");
              setSort("recent");
            }}
          >
            Reset
          </button>
        </div>

        {/* Chips */}
        <div className={styles.chips}>
          <div className={styles.chipsGroup}>
            <div className={styles.chipsTitle}>Catégories</div>
            <div className={styles.chipsRow}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.chip} ${category === c ? styles.chipOn : ""}`}
                  onClick={() => setQuickCategory(c)}
                  aria-pressed={category === c}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.chipsGroup}>
            <div className={styles.chipsTitle}>Gamme</div>
            <div className={styles.chipsRow}>
              {(["eco", "comfort", "premium"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.chip} ${tier === t ? styles.chipOn : ""}`}
                  onClick={() => setQuickTier(t)}
                  aria-pressed={tier === t}
                >
                  {t === "eco"
                    ? "Eco"
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
          <div className={styles.empty}>Aucun résultat avec ces filtres.</div>
        ) : null}

        {offers.map((o) => {
          const liked = favIds.has(o.id);
          const busy = busyId === o.id;

          const price =
            typeof o.price_from_eur === "number"
              ? `À partir de ${o.price_from_eur}€`
              : "Prix variable";

          const duration = o.duration_days ? `${o.duration_days} jours` : null;
          const persons = o.persons ? `${o.persons} pers.` : null;
          const depart = o.departure_city || o.departure_airport || null;

          const secondary = [
            depart ? `Départ: ${depart}` : null,
            duration,
            persons,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <article key={o.id} className={styles.card}>
              <div className={styles.media}>
                <div
                  className={styles.bg}
                  style={
                    o.image_url
                      ? { backgroundImage: `url(${o.image_url})` }
                      : undefined
                  }
                />

                {/* Badges (tu styliseras premium) */}
                <div className={styles.badges}>
                  {o.tier ? (
                    <span className={styles.badge}>
                      {o.tier === "eco"
                        ? "Eco"
                        : o.tier === "comfort"
                          ? "Confort"
                          : "Premium"}
                    </span>
                  ) : null}

                  {o.category ? (
                    <span className={styles.badgeAlt}>{o.category}</span>
                  ) : null}
                </div>

                <button
                  type="button"
                  className={`${styles.heart} ${liked ? styles.heartOn : ""}`}
                  onClick={() => toggleFavorite(o.id)}
                  disabled={busy}
                  aria-label={
                    liked ? "Retirer des favoris" : "Ajouter aux favoris"
                  }
                  title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  ❤︎
                </button>
              </div>

              <div className={styles.body}>
                <div className={styles.titleRow}>
                  <strong className={styles.title}>{o.title}</strong>
                  <span className={styles.destination}>{o.destination}</span>
                </div>

                <div className={styles.meta}>
                  <span className={styles.price}>{price}</span>
                  {secondary ? (
                    <span className={styles.secondary}>{secondary}</span>
                  ) : null}
                </div>

                {o.tags?.length ? (
                  <div className={styles.tags}>
                    {o.tags.slice(0, 6).map((t) => (
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
