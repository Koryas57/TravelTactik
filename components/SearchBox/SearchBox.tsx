"use client";

import { useMemo, useState } from "react";
import styles from "./SearchBox.module.scss";

type ComfortLevel = "eco" | "comfort" | "premium";

type TripBrief = {
  destination: string;
  durationDays: number;
  travelers: number;
  comfort: ComfortLevel;
  budgetMax: number;
  avoidLayovers: boolean;
};

const comfortLabels: Record<ComfortLevel, string> = {
  eco: "Éco",
  comfort: "Confort",
  premium: "Premium",
};

export function SearchBox() {
  const [brief, setBrief] = useState<TripBrief>({
    destination: "",
    durationDays: 7,
    travelers: 2,
    comfort: "comfort",
    budgetMax: 1200,
    avoidLayovers: true,
  });

  const summary = useMemo(() => {
    const dest = brief.destination.trim()
      ? brief.destination.trim()
      : "Destination flexible";
    const layovers = brief.avoidLayovers
      ? "sans escales (si possible)"
      : "escales OK";
    return `${dest} • ${brief.durationDays} j • ${brief.travelers} pers • ${
      comfortLabels[brief.comfort]
    } • ≤ ${brief.budgetMax}€ • ${layovers}`;
  }, [brief]);

  function set<K extends keyof TripBrief>(key: K, value: TripBrief[K]) {
    setBrief((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // MVP: pas de backend. On garde local + on scroll vers les scénarios.
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
              value={brief.destination}
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
              value={brief.durationDays}
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
              value={brief.travelers}
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
                const active = brief.comfort === level;
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
                value={brief.budgetMax}
                onChange={(e) => set("budgetMax", Number(e.target.value))}
              />
              <div
                className={styles.pill}
                aria-label={`Budget maximum ${brief.budgetMax} euros`}
              >
                ≤ {brief.budgetMax}€
              </div>
            </div>
          </div>

          <div className={styles.fieldWide}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={brief.avoidLayovers}
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
