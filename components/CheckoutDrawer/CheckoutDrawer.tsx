"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./CheckoutDrawer.module.scss";
import type { ComfortLevel, TripBrief } from "../tripBrief";

type Props = {
  open: boolean;
  onClose: () => void;
  brief: TripBrief;
  selectedPlan: ComfortLevel | null;
};

export function CheckoutDrawer({ open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

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
    const el = panelRef.current?.querySelector<HTMLAnchorElement>(
      'a[data-primary-cta="true"]',
    );
    el?.focus();
  }, [open]);

  if (!open) return null;

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
            <div className={styles.brand}>
              <Image
                className={styles.brandLogoImage}
                src="/images/LogoTravel.png"
                alt="Logo TravelTactik"
                width={44}
                height={55}
              />
              <span className={styles.brandText}>TRAVEL TACTIK</span>
            </div>
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

        <div className={styles.howCard}>
          <div className={styles.cardTitle}>Notre méthode 💡</div>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <div className={styles.stepTitle}>1. Premier contact gratuit</div>
              <div className={styles.stepText}>
                Message ou appel de 30 min max pour cadrer ton projet.
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepTitle}>
                2. Synthèse + devis dans ton espace
              </div>
              <div className={styles.stepText}>
                Tu reçois une synthèse claire et un devis peu après l’échange,
                avec notification par email.
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepTitle}>
                3. Devis en attente d’acceptation (7 jours)
              </div>
              <div className={styles.stepText}>
                Le devis reste valable 7 jours pour valider la suite.
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepTitle}>
                4. Paiement requis pour les liens de réservation
              </div>
              <div className={styles.stepText}>
                Le PDF Tarifs contiendra les liens aux prix négociés.
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepTitle}>
                5. PDF Tarifs en &lt; 24h après paiement
              </div>
              <div className={styles.stepText}>
                Tu télécharges le PDF Tarifs et effectues tes réservations aux
                prix convenus.
              </div>
            </li>
            <li className={styles.step}>
              <div className={styles.stepTitle}>
                6. Carnet de voyage (optionnel)
              </div>
              <div className={styles.stepText}>
                Si tu as choisi le carnet et l’as payé, tu le reçois dans les
                délais convenus.
              </div>
            </li>
          </ol>

          <div className={styles.howNote}>
            Dès qu’un document est disponible dans ton espace client, tu reçois
            automatiquement une notification par email.
          </div>

          <Link
            href="/appel-decouverte"
            className={`${styles.primaryBtn} ${styles.ctaBounce}`}
            data-primary-cta="true"
            onClick={onClose}
          >
            J’ai compris, je passe à l’action →
          </Link>
        </div>
      </div>
    </div>
  );
}
