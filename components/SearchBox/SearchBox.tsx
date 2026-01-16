"use client";

import { useMemo } from "react";
import styles from "./SearchBox.module.scss";
import type { TripBrief } from "../tripBrief";
import { comfortLabels } from "../tripBrief";

type Props = {
  value: TripBrief;
  onChange: (next: TripBrief) => void;
};

export function SearchBox({ value, onChange }: Props) {
  const summary = useMemo(() => {
    const dest = value.destination.trim()
      ? value.destination.trim()
      : "Destination flexible";
    const layovers = value.avoidLayovers
      ? "sans escales (si possible)"
      : "escales OK";
    return `${dest} • ${value.durationDays} j • ${value.travelers} pers • ${
      comfortLabels[value.comfort]
    } • ≤ ${value.budgetMax}€ • ${layovers}`;
  }, [value]);

  function set<K extends keyof TripBrief>(key: K, v: TripBrief[K]) {
    onChange({ ...value, [key]: v });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const el = document.getElementById("scenarios");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className={styles.wrap} aria-label="Brief voyage">
      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.top}>
          <div>
            <div className={styles.title}>Ton brief</div>
            <div className={styles.subtitle}>{summary}</div>
          </div>

          <button className={styles.primary} type="submit">
            Voir mes 3 plans
          </button>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="destination">
              Destination
            </label>
            <input
              id="destination"
              className={styles.input}
              placeholder="Bangkok, Lisbonne, Tokyo… (ou laisse vide)"
              value={value.destination}
              onChange={(e) => set("destination", e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="duration">
              Durée (jours)
            </label>
            <input
              id="duration"
              className={styles.input}
              type="number"
              min={2}
              max={30}
              value={value.durationDays}
              onChange={(e) => set("durationDays", Number(e.target.value || 0))}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="travelers">
              Voyageurs
            </label>
            <input
              id="travelers"
              className={styles.input}
              type="number"
              min={1}
              max={10}
              value={value.travelers}
              onChange={(e) => set("travelers", Number(e.target.value || 0))}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Style</span>
            <div
              className={styles.segment}
              role="radiogroup"
              aria-label="Niveau de confort"
            >
              {(["eco", "comfort", "premium"] as const).map((level) => {
                const active = value.comfort === level;
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`${styles.segmentItem} ${
                      active ? styles.active : ""
                    }`}
                    onClick={() => set("comfort", level)}
                  >
                    {comfortLabels[level]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.fieldWide}>
            <label className={styles.label} htmlFor="budget">
              Budget max (€/personne)
            </label>
            <div className={styles.rangeRow}>
              <input
                id="budget"
                className={styles.range}
                type="range"
                min={200}
                max={4000}
                step={50}
                value={value.budgetMax}
                onChange={(e) => set("budgetMax", Number(e.target.value))}
              />
              <div
                className={styles.pill}
                aria-label={`Budget maximum ${value.budgetMax} euros`}
              >
                ≤ {value.budgetMax}€
              </div>
            </div>
          </div>

          <div className={styles.fieldWide}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={value.avoidLayovers}
                onChange={(e) => set("avoidLayovers", e.target.checked)}
              />
              <span>Éviter les escales (si possible)</span>
            </label>
          </div>
        </div>
      </form>
    </section>
  );
}
