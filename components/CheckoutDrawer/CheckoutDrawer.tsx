"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CheckoutDrawer.module.scss";
import type { ComfortLevel, TripBrief } from "../tripBrief";
import { comfortLabels } from "../tripBrief";

type ServicePack = "audit" | "itinerary" | "concierge";
type DeliverySpeed = "standard" | "urgent";

type Props = {
  open: boolean;
  onClose: () => void;
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
};

const packLabels: Record<ServicePack, string> = {
  audit: "Audit express",
  itinerary: "Itinéraire optimisé",
  concierge: "Full concierge",
};

const packDesc: Record<ServicePack, string> = {
  audit: "Un plan court et clair: vols + logement + 2–3 scénarios.",
  itinerary: "Un itinéraire jour par jour + optimisations budget/temps.",
  concierge: "On verrouille tout: options, alternatives, check-list, risques.",
};

const packPriceEUR: Record<ServicePack, number> = {
  audit: 19,
  itinerary: 49,
  concierge: 99,
};

const speedLabels: Record<DeliverySpeed, string> = {
  standard: "Standard (≤ 24h)",
  urgent: "Urgent (≤ 2h)",
};

export function CheckoutDrawer({ open, onClose, brief, selectedPlan }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [pack, setPack] = useState<ServicePack>("itinerary");
  const [speed, setSpeed] = useState<DeliverySpeed>("standard");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Anti-spam simple: timestamp "ouverture du drawer" (utilisé côté API)
  const openedAtRef = useRef<number>(Date.now());

  // reset success when re-open
  useEffect(() => {
    if (open) {
      setSent(false);
      setError(null);
      openedAtRef.current = Date.now();
    }
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // focus email on open
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );
    el?.focus();
  }, [open]);

  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dest = brief.destination.trim()
    ? brief.destination.trim()
    : "Destination flexible";
  const planLabel = selectedPlan
    ? comfortLabels[selectedPlan]
    : "Non sélectionné";

  const price = useMemo(() => {
    const base = packPriceEUR[pack];
    const urgentFee = speed === "urgent" ? 20 : 0;
    return base + urgentFee;
  }, [pack, speed]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);

    const payload = {
      email: String(fd.get("email") || "").trim(),
      notes: String(fd.get("notes") || "").trim(),
      pack,
      speed,
      priceEUR: price,
      brief,
      selectedPlan,
      createdAt: new Date().toISOString(),

      // anti-bot: honeypot + timestamp d'ouverture + page
      hp: String(fd.get("company") || "").trim(), // honeypot
      ts: openedAtRef.current, // ms epoch
      page: typeof window !== "undefined" ? window.location.href : undefined,
    };

    try {
      setSending(true);

      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Erreur serveur");
      }

      setSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Obtenir mon plan"
    >
      <button
        className={styles.backdrop}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
      />

      <div className={styles.panel} ref={panelRef}>
        <div className={styles.top}>
          <div>
            <div className={styles.kicker}>Checkout</div>
            <div className={styles.title}>Obtenir mon plan</div>
            <div className={styles.sub}>
              Tu réserves toi-même. Je te donne une stratégie claire, chiffrée
              et actionnable.
            </div>
          </div>

          <button
            className={styles.close}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Destination</span>
            <strong>{dest}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Durée</span>
            <strong>{brief.durationDays} jours</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Voyageurs</span>
            <strong>{brief.travelers}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Plan</span>
            <strong>{planLabel}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Budget max</span>
            <strong>≤ {brief.budgetMax}€ / pers</strong>
          </div>
        </div>

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successTitle}>C’est envoyé.</div>
            <div className={styles.successText}>
              Je reviens vers toi par email avec la suite (questions éventuelles
              + timing).
            </div>

            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="button"
                onClick={onClose}
              >
                Fermer
              </button>
              <a className={styles.secondary} href="#brief" onClick={onClose}>
                Modifier mon brief
              </a>
            </div>

            <div className={styles.legal}>
              Envoi confirmé par email. Pense à vérifier tes spams si besoin.
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.blockTitle}>Choisis ton pack</div>
            {error ? <div className={styles.error}>{error}</div> : null}

            {/* Honeypot (anti-bot) : doit rester vide */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <div className={styles.packs}>
              {(["audit", "itinerary", "concierge"] as const).map((p) => {
                const active = pack === p;
                return (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.pack} ${active ? styles.packActive : ""}`}
                    onClick={() => setPack(p)}
                    aria-pressed={active}
                  >
                    <div className={styles.packTop}>
                      <div className={styles.packName}>{packLabels[p]}</div>
                      <div className={styles.packPrice}>{packPriceEUR[p]}€</div>
                    </div>
                    <div className={styles.packDesc}>{packDesc[p]}</div>
                  </button>
                );
              })}
            </div>

            <div className={styles.blockTitle}>Délai</div>
            <div className={styles.speedRow}>
              {(["standard", "urgent"] as const).map((s) => {
                const active = speed === s;
                const hint = s === "urgent" ? "+20€" : "inclus";
                return (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.speed} ${active ? styles.speedActive : ""}`}
                    onClick={() => setSpeed(s)}
                    aria-pressed={active}
                  >
                    <div className={styles.speedName}>{speedLabels[s]}</div>
                    <div className={styles.speedHint}>{hint}</div>
                  </button>
                );
              })}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                className={styles.input}
                type="email"
                placeholder="ton@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="notes">
                Contraintes (optionnel)
              </label>
              <textarea
                id="notes"
                name="notes"
                className={styles.textarea}
                placeholder="Dates, aéroports préférés, bagages, rythme, enfants, budget total, etc."
                rows={4}
              />
            </div>

            <div className={styles.totalRow} aria-label="Total">
              <span>Total</span>
              <strong>{price}€ / dossier</strong>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="submit"
                disabled={sending}
              >
                {sending ? "Envoi..." : "Envoyer ma demande"}
              </button>
              <button
                className={styles.secondary}
                type="button"
                onClick={onClose}
              >
                Pas maintenant
              </button>
            </div>

            <div className={styles.legal}>
              En envoyant, tu acceptes d’être recontacté au sujet de ta demande.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
