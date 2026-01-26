"use client";

import styles from "./OfferCard.module.scss";

type Tier = "eco" | "comfort" | "premium";

export type Offer = {
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

  tags: string[];
  meta: any;

  created_at: string;
  updated_at: string;
};

type Props = {
  offer: Offer;
  liked?: boolean;
  busy?: boolean;
  onToggleFavorite?: (offerId: string) => void;
  showFavorite?: boolean;
};

export function OfferCard({
  offer: o,
  liked = false,
  busy = false,
  onToggleFavorite,
  showFavorite = true,
}: Props) {
  const price =
    typeof o.price_from_eur === "number"
      ? `À partir de ${o.price_from_eur}€`
      : "Prix variable";

  const duration = o.duration_days ? `${o.duration_days} jours` : null;
  const persons = o.persons ? `${o.persons} pers.` : null;
  const depart = o.departure_city || o.departure_airport || null;

  const secondary = [depart ? `Départ: ${depart}` : null, duration, persons]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <div
          className={styles.bg}
          style={
            o.image_url ? { backgroundImage: `url(${o.image_url})` } : undefined
          }
        />

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

        {showFavorite ? (
          <button
            type="button"
            className={`${styles.heart} ${liked ? styles.heartOn : ""}`}
            onClick={() => onToggleFavorite?.(o.id)}
            disabled={busy || !onToggleFavorite}
            aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            ❤︎
          </button>
        ) : null}
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
}
