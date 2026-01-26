"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./CheckoutDrawer.module.scss";
import type { ComfortLevel, TripBrief } from "../tripBrief";
import { comfortLabels } from "../tripBrief";

type Props = {
  open: boolean;
  onClose: () => void;
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
};

type TabKey = "call" | "how";

export function CheckoutDrawer({ open, onClose, brief, selectedPlan }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = useState<TabKey>("call");

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // lock body scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // focus on open
  useEffect(() => {
    if (!open) return;
    setTab("call");
    const el = panelRef.current?.querySelector<HTMLAnchorElement>(
      'a[data-primary-cta="true"]',
    );
    el?.focus();
  }, [open]);

  if (!open) return null;

  const comfortText = selectedPlan ? comfortLabels[selectedPlan] : "Confort";
  const destinationText = brief?.destination?.trim()
    ? brief.destination.trim()
    : "Destination à définir";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Appel découverte"
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
            <div className={styles.kicker}>TravelTactik</div>
            <div className={styles.title}>Appel découverte gratuit</div>
            <div className={styles.sub}>
              Un créneau. Un cadrage clair. Un plan d’action.
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

        <div className={styles.tabs} role="tablist" aria-label="Onglets">
          <button
            type="button"
            className={`${styles.tab} ${tab === "call" ? styles.tabActive : ""}`}
            onClick={() => setTab("call")}
            role="tab"
            aria-selected={tab === "call"}
          >
            Réserver l’appel
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === "how" ? styles.tabActive : ""}`}
            onClick={() => setTab("how")}
            role="tab"
            aria-selected={tab === "how"}
          >
            Process
          </button>
        </div>

        {tab === "how" ? (
          <div className={styles.howCard}>
            <div className={styles.cardTitle}>Comment ça marche</div>
            <ol className={styles.howList}>
              <li>Appel découverte</li>
              <li>Étude & devis</li>
              <li>Organisation</li>
              <li>Réservation</li>
              <li>Carnet de voyage</li>
              <li>Bon voyage</li>
            </ol>
          </div>
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Ton contexte (optionnel)</div>

              <div className={styles.chips}>
                <span className={styles.chip}>{destinationText}</span>
                <span className={styles.chip}>Niveau : {comfortText}</span>
                {brief?.travelers ? (
                  <span className={styles.chip}>
                    {brief.travelers} voyageur(s)
                  </span>
                ) : null}
                {brief?.durationDays ? (
                  <span className={styles.chip}>
                    {brief.durationDays} jours
                  </span>
                ) : null}
              </div>

              <p className={styles.cardText}>
                L’appel sert à cadrer les priorités (budget, rythme, dates,
                contraintes) pour avancer vite et sans flou.
              </p>

              <div className={styles.actions}>
                <Link
                  href="/appel-decouverte"
                  className={styles.primaryBtn}
                  data-primary-cta="true"
                  onClick={onClose}
                >
                  Ouvrir le calendrier
                </Link>
                <Link
                  href="/offres"
                  className={styles.secondaryBtn}
                  onClick={onClose}
                >
                  Voir les offres
                </Link>
              </div>

              <div className={styles.micro}>
                Confirmation + invitation agenda envoyées automatiquement après
                réservation.
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Ce que tu obtiens</div>
              <ul className={styles.bullets}>
                <li>Un cadrage clair (priorités, contraintes, budget)</li>
                <li>Une direction : Éco / Confort / Premium</li>
                <li>
                  Une stratégie de recherche adaptée (transport + hébergement)
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
