"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./AdminOffers.module.scss";
import Link from "next/link";

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

const TIERS = ["", "eco", "comfort", "premium"] as const;

type Tier = "eco" | "comfort" | "premium";

type OfferRow = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  image_url: string | null;
  category: string | null;
  tier: Tier | null;
  price_from_eur: number | null;
  duration_days: number | null;
  persons: number | null;
  departure_city: string | null;
  departure_airport: string | null;
  is_published: boolean;
  meta: any;
  updated_at: string;
};

function formatTier(t: Tier | null) {
  if (!t) return "—";
  if (t === "eco") return "Eco";
  if (t === "comfort") return "Confort";
  return "Premium";
}

export function AdminOffersClient() {
  const [rows, setRows] = useState<OfferRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [published, setPublished] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (category) p.set("category", category);
    if (tier) p.set("tier", tier);
    if (published) p.set("published", published);
    p.set("limit", "200");
    return p.toString();
  }, [q, category, tier, published]);

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

  async function createOffer(input: {
    title: string;
    destination: string;
    category?: string | null;
    tier?: string | null;
    accommodationType?: string | null;
    transportType?: string | null;
    activityExamples?: string | null;
  }) {
    const { accommodationType, transportType, activityExamples, ...payload } =
      input;
    const res = await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        meta: {
          ...(accommodationType
            ? { accommodation_type: accommodationType }
            : {}),
          ...(transportType ? { transport_type: transportType } : {}),
          ...(activityExamples ? { activity_examples: activityExamples } : {}),
        },
      }),
    });
    const data = (await res.json()) as {
      ok: boolean;
      row?: OfferRow;
      error?: string;
    };
    if (!res.ok || !data.ok) throw new Error(data.error || "Erreur serveur");
  }

  async function patchOffer(input: Partial<OfferRow> & { id: string }) {
    const res = await fetch("/api/admin/offers", {
      method: "PATCH",
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
            Créer / éditer les cards affichées sur /offres.
          </p>
        </div>

        <div className={styles.topActions}>
          <button className={styles.refresh} onClick={load} disabled={loading}>
            {loading ? "Chargement..." : "Rafraîchir"}
          </button>
        </div>
      </div>

      <CreateOffer
        onCreate={async (v) => {
          await createOffer(v);
          await load();
        }}
      />

      <section className={styles.filtersCard}>
        <div className={styles.filters}>
          <label className={styles.filter}>
            <span>Recherche</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Bangkok, Lisbonne, CDG…"
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
            <span>Gamme</span>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              {TIERS.map((t) => (
                <option key={t || "__all"} value={t}>
                  {t ? t : "Toutes"}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filter}>
            <span>Publié</span>
            <select
              value={published}
              onChange={(e) => setPublished(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="true">Publié</option>
              <option value="false">Brouillon</option>
            </select>
          </label>

          <button
            className={styles.secondary}
            type="button"
            onClick={() => {
              setQ("");
              setCategory("");
              setTier("");
              setPublished("");
            }}
          >
            Reset
          </button>
        </div>
      </section>

      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.grid}>
        {rows.map((o) => (
          <OfferEditor
            key={o.id}
            offer={o}
            onSave={async (p) => {
              await patchOffer({ id: o.id, ...p });
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

function CreateOffer({
  onCreate,
}: {
  onCreate: (v: {
    title: string;
    destination: string;
    category?: string | null;
    tier?: string | null;
    accommodationType?: string | null;
    transportType?: string | null;
    activityExamples?: string | null;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [accommodationType, setAccommodationType] = useState("");
  const [transportType, setTransportType] = useState("");
  const [activityExamples, setActivityExamples] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (title.trim().length < 2 || destination.trim().length < 2) return;
    setSaving(true);
    try {
      await onCreate({
        title: title.trim(),
        destination: destination.trim(),
        category: category ? category : null,
        tier: tier ? tier : null,
        accommodationType: accommodationType.trim() || null,
        transportType: transportType.trim() || null,
        activityExamples: activityExamples.trim() || null,
      });
      setTitle("");
      setDestination("");
      setCategory("");
      setTier("");
      setAccommodationType("");
      setTransportType("");
      setActivityExamples("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.createCard}>
      <div className={styles.createTop}>
        <div>
          <div className={styles.createTitle}>Créer une offre</div>
          <div className={styles.createSub}>
            Crée la card, puis complète les détails juste en dessous.
          </div>
          <Link href="/admin/leads" style={{ fontWeight: 700 }}>
            Vers l'éditeur de Leads & PDF →
          </Link>
        </div>

        <button
          className={styles.primaryBtn}
          type="button"
          onClick={submit}
          disabled={saving}
        >
          {saving ? "…" : "Créer"}
        </button>
      </div>

      <div className={styles.createGrid}>
        <label className={styles.field}>
          <span>Titre</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex: Bangkok malin 7j"
          />
        </label>

        <label className={styles.field}>
          <span>Destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="ex: Bangkok"
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
                {c ? c : "—"}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Gamme (étiquette)</span>
          <select value={tier} onChange={(e) => setTier(e.target.value)}>
            <option value="">—</option>
            <option value="eco">Eco</option>
            <option value="comfort">Confort</option>
            <option value="premium">Premium</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Type d&apos;hébergement</span>
          <input
            value={accommodationType}
            onChange={(e) => setAccommodationType(e.target.value)}
            placeholder="ex: Boutique-hôtel, villa, lodge…"
          />
        </label>

        <label className={styles.fieldWide}>
          <span>Type de transport</span>
          <input
            value={transportType}
            onChange={(e) => setTransportType(e.target.value)}
            placeholder="ex: Vol direct, TGV, ferry…"
          />
        </label>

        <label className={styles.fieldWide}>
          <span>Exemples d&apos;activités</span>
          <textarea
            value={activityExamples}
            onChange={(e) => setActivityExamples(e.target.value)}
            placeholder="ex: randonnée, visite guidée, spa…"
            rows={3}
          />
        </label>
      </div>
    </section>
  );
}

function OfferEditor({
  offer,
  onSave,
}: {
  offer: OfferRow;
  onSave: (p: Partial<OfferRow>) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(offer.title);
  const [destination, setDestination] = useState(offer.destination);
  const [imageUrl, setImageUrl] = useState(offer.image_url || "");
  const [category, setCategory] = useState(offer.category || "");
  const [tier, setTier] = useState<string>(offer.tier || "");
  const [priceFrom, setPriceFrom] = useState<string>(
    offer.price_from_eur === null ? "" : String(offer.price_from_eur),
  );
  const [durationDays, setDurationDays] = useState<string>(
    offer.duration_days === null ? "" : String(offer.duration_days),
  );
  const [persons, setPersons] = useState<string>(
    offer.persons === null ? "" : String(offer.persons),
  );
  const [depCity, setDepCity] = useState(offer.departure_city || "");
  const [depAirport, setDepAirport] = useState(offer.departure_airport || "");
  const [published, setPublished] = useState<boolean>(offer.is_published);
  const [accommodationType, setAccommodationType] = useState(
    offer.meta?.accommodation_type || "",
  );
  const [transportType, setTransportType] = useState(
    offer.meta?.transport_type || "",
  );
  const [activityExamples, setActivityExamples] = useState(
    offer.meta?.activity_examples || "",
  );

  async function save() {
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        destination: destination.trim(),
        image_url: imageUrl.trim() || null,
        category: category ? category : null,
        tier: tier ? (tier as any) : null,
        price_from_eur:
          priceFrom.trim() === ""
            ? null
            : Math.max(0, Math.trunc(Number(priceFrom))),
        duration_days:
          durationDays.trim() === ""
            ? null
            : Math.max(1, Math.trunc(Number(durationDays))),
        persons:
          persons.trim() === ""
            ? null
            : Math.max(1, Math.trunc(Number(persons))),
        departure_city: depCity.trim() || null,
        departure_airport: depAirport.trim() || null,
        is_published: published,
        meta: {
          ...(offer.meta && typeof offer.meta === "object" ? offer.meta : {}),
          accommodation_type: accommodationType.trim() || null,
          transport_type: transportType.trim() || null,
          activity_examples: activityExamples.trim() || null,
        },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className={styles.offerCard}>
      <div className={styles.offerTop}>
        <div>
          <div className={styles.slug}>{offer.slug}</div>
          <div className={styles.offerMetaLine}>
            <span className={styles.pill}>{category || "Draft"}</span>
            <span className={styles.pillAlt}>
              {formatTier((tier as Tier) || null)}
            </span>
            <span
              className={`${styles.pill} ${published ? styles.pillOn : styles.pillOff}`}
            >
              {published ? "Publié" : "Brouillon"}
            </span>
          </div>
        </div>

        <button className={styles.smallBtn} onClick={save} disabled={saving}>
          {saving ? "…" : "Enregistrer"}
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Identité</div>
        <div className={styles.formGrid}>
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
            <span>Catégorie</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c || "__all"} value={c}>
                  {c ? c : "—"}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Gamme (étiquette)</span>
            <select value={tier} onChange={(e) => setTier(e.target.value)}>
              <option value="">—</option>
              <option value="eco">Eco</option>
              <option value="comfort">Confort</option>
              <option value="premium">Premium</option>
            </select>
          </label>

          <label className={styles.fieldWide}>
            <span>Image URL</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>

          <label className={styles.fieldWide}>
            <span>Type d&apos;hébergement</span>
            <input
              value={accommodationType}
              onChange={(e) => setAccommodationType(e.target.value)}
              placeholder="ex: Boutique-hôtel, villa, lodge…"
            />
          </label>

          <label className={styles.fieldWide}>
            <span>Type de transport</span>
            <input
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              placeholder="ex: Vol direct, TGV, ferry…"
            />
          </label>

          <label className={styles.fieldWide}>
            <span>Exemples d&apos;activités</span>
            <textarea
              value={activityExamples}
              onChange={(e) => setActivityExamples(e.target.value)}
              placeholder="ex: randonnée, visite guidée, spa…"
              rows={3}
            />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Prix & logistique</div>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>À partir de (€)</span>
            <input
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              inputMode="numeric"
              placeholder="ex: 199"
            />
          </label>

          <label className={styles.field}>
            <span>Durée (jours)</span>
            <input
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              inputMode="numeric"
              placeholder="ex: 7"
            />
          </label>

          <label className={styles.field}>
            <span>Personnes</span>
            <input
              value={persons}
              onChange={(e) => setPersons(e.target.value)}
              inputMode="numeric"
              placeholder="ex: 2"
            />
          </label>

          <label className={styles.field}>
            <span>Ville départ</span>
            <input
              value={depCity}
              onChange={(e) => setDepCity(e.target.value)}
              placeholder="ex: Marseille"
            />
          </label>

          <label className={styles.field}>
            <span>Aéroport départ</span>
            <input
              value={depAirport}
              onChange={(e) => setDepAirport(e.target.value)}
              placeholder="ex: MRS / CDG"
            />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Publication</div>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <div>
            <div className={styles.checkTitle}>Publié</div>
            <div className={styles.checkHint}>
              Si activé, la card est visible sur /offres.
            </div>
          </div>
        </label>
      </div>
    </article>
  );
}
