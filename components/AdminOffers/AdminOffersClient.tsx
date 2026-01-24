"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AdminOffers.module.scss";

const CATEGORIES = [
  "",
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

type Tier = "eco" | "comfort" | "premium";

type TierRow = {
  tier: Tier;
  from_price_eur: number | null;
  summary: string | null;
  is_active: boolean;
};

type OfferRow = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  image_url: string | null;
  category: string | null;
  min_price_eur: number | null;
  tiers: TierRow[] | null;
  updated_at: string;
};

function normalizeTiers(tiers: TierRow[] | null | undefined) {
  const map = new Map<Tier, TierRow>();
  for (const t of tiers || []) map.set(t.tier, t);
  return (["eco", "comfort", "premium"] as const).map((k) => {
    const v = map.get(k);
    return (
      v || {
        tier: k,
        from_price_eur: null,
        summary: "",
        is_active: true,
      }
    );
  });
}

export function AdminOffersClient() {
  const [rows, setRows] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (category) p.set("category", category);
    if (tier) p.set("tier", tier);
    p.set("limit", "200");
    return p.toString();
  }, [q, category, tier]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/offers?${qs}`, { cache: "no-store" });
      const data = (await res.json()) as {
        ok: boolean;
        rows?: OfferRow[];
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

  async function patchOffer(input: {
    id: string;
    title?: string;
    destination?: string;
    image_url?: string;
    category?: string | null;
  }) {
    const res = await fetch("/api/admin/offers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error || "Erreur serveur");
  }

  async function upsertTier(input: {
    offerId: string;
    tier: Tier;
    from_price_eur: number | null;
    summary: string;
    is_active: boolean;
  }) {
    const res = await fetch("/api/admin/offers/tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !data.ok) throw new Error(data.error || "Erreur serveur");
  }

  return (
    <main className="container" style={{ padding: "28px 0" }}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.h1}>Admin — Offres</h1>
          <p className={styles.sub}>
            Catalogue éditable (catégories, prix “à partir de”, contenus
            Eco/Confort/Premium).
          </p>
        </div>

        <button className={styles.refresh} onClick={load} disabled={loading}>
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      <div className={styles.filters}>
        <label className={styles.filter}>
          <span>Recherche</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Bangkok, Lisbonne, tokyo-premium…"
          />
        </label>

        <label className={styles.filter}>
          <span>Catégorie</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c || "__all"} value={c}>
                {c ? c : "Toutes"}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.filter}>
          <span>Tier</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="">Tous</option>
            <option value="eco">Eco</option>
            <option value="comfort">Confort</option>
            <option value="premium">Premium</option>
          </select>
        </label>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.grid}>
        {rows.map((o) => (
          <OfferEditor
            key={o.id}
            offer={o}
            onPatch={async (p) => {
              await patchOffer({ id: o.id, ...p });
              await load();
            }}
            onUpsertTier={async (t) => {
              await upsertTier({ offerId: o.id, ...t });
              await load();
            }}
          />
        ))}
      </div>

      {!rows.length && !loading ? (
        <div className={styles.empty}>Aucun résultat.</div>
      ) : null}
    </main>
  );
}

function OfferEditor({
  offer,
  onPatch,
  onUpsertTier,
}: {
  offer: OfferRow;
  onPatch: (p: {
    title?: string;
    destination?: string;
    image_url?: string;
    category?: string | null;
  }) => Promise<void>;
  onUpsertTier: (t: {
    tier: Tier;
    from_price_eur: number | null;
    summary: string;
    is_active: boolean;
  }) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(offer.title);
  const [destination, setDestination] = useState(offer.destination);
  const [imageUrl, setImageUrl] = useState(offer.image_url || "");
  const [category, setCategory] = useState(offer.category || "");

  const tiers = normalizeTiers(offer.tiers);

  async function saveBase() {
    setSaving(true);
    try {
      await onPatch({
        title,
        destination,
        image_url: imageUrl || "",
        category: category ? category : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.slug}>{offer.slug}</div>
          <div className={styles.minPrice}>
            À partir de <strong>{offer.min_price_eur ?? "—"}€</strong>
          </div>
        </div>
        <button
          className={styles.smallBtn}
          onClick={saveBase}
          disabled={saving}
        >
          {saving ? "…" : "Enregistrer"}
        </button>
      </div>

      <div className={styles.form}>
        <label className={styles.field}>
          <span>Titre</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className={styles.field}>
          <span>Destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Image URL</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>

        <label className={styles.field}>
          <span>Catégorie</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c || "__all"} value={c}>
                {c ? c : "— (draft)"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.tiers}>
        {tiers.map((t) => (
          <TierEditor
            key={t.tier}
            tier={t}
            onSave={async (next) => {
              setSaving(true);
              try {
                await onUpsertTier(next);
              } finally {
                setSaving(false);
              }
            }}
          />
        ))}
      </div>
    </article>
  );
}

function TierEditor({
  tier,
  onSave,
}: {
  tier: TierRow;
  onSave: (t: {
    tier: Tier;
    from_price_eur: number | null;
    summary: string;
    is_active: boolean;
  }) => Promise<void>;
}) {
  const [price, setPrice] = useState<string>(
    tier.from_price_eur === null ? "" : String(tier.from_price_eur),
  );
  const [summary, setSummary] = useState<string>(tier.summary || "");
  const [isActive, setIsActive] = useState<boolean>(tier.is_active);
  const [saving, setSaving] = useState(false);

  const label =
    tier.tier === "eco"
      ? "Eco"
      : tier.tier === "comfort"
        ? "Confort"
        : "Premium";

  async function save() {
    setSaving(true);
    try {
      const p =
        price.trim() === "" ? null : Math.max(0, Math.trunc(Number(price)));
      if (price.trim() !== "" && Number.isNaN(p as any)) return;

      await onSave({
        tier: tier.tier,
        from_price_eur: p,
        summary,
        is_active: isActive,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.tier}>
      <div className={styles.tierTop}>
        <div className={styles.tierName}>{label}</div>
        <button className={styles.smallBtn} onClick={save} disabled={saving}>
          {saving ? "…" : "Save"}
        </button>
      </div>

      <label className={styles.field}>
        <span>À partir de (€)</span>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="numeric"
          placeholder="ex: 199"
        />
      </label>

      <label className={styles.field}>
        <span>Résumé (1–2 lignes)</span>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
        />
      </label>

      <label className={styles.check}>
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <span>Actif</span>
      </label>
    </div>
  );
}
