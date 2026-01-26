"use client";

import Link from "next/link";
import styles from "./HomeClient.module.scss";
import { OffersPreviewFromOffres } from "../OffersPreviewFromOffres/OffersPreviewFromOffres";
import { DocumentsPreview } from "../DocumentsPreview/DocumentsPreview";
import { FAQ } from "../FAQ/FAQ";
import { AboutSection } from "../AboutSection/AboutSection";

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="rgba(30, 64, 255, 0.95)"
        d="M6.6 10.8c1.5 3 3.9 5.5 7 7l2.3-2.3c.3-.3.8-.4 1.2-.2c1.1.4 2.3.7 3.6.7c.7 0 1.3.6 1.3 1.3V21c0 .7-.6 1.3-1.3 1.3C10.4 22.3 1.7 13.6 1.7 3.3C1.7 2.6 2.3 2 3 2h3.8c.7 0 1.3.6 1.3 1.3c0 1.2.2 2.5.7 3.6c.1.4 0 .9-.3 1.2L6.6 10.8z"
      />
    </svg>
  );
}

export function HomeClient() {
  return (
    <>
      {/* HERO (background + titre + appel) */}
      <section className={styles.hero} id="top">
        <div className={styles.heroBg} />

        <div className={styles.heroInner}>
          <div className={styles.heroTop}>
            <h1 className={styles.heroH1}>Même voyage. Meilleur plan.</h1>
            <p className={styles.heroLead}>
              Tu réserves. TravelTactik t’aide à optimiser budget, confort et
              itinéraire — avec une sélection claire, actionnable, sans flou.
            </p>
          </div>

          <div className={styles.callCard} id="appel">
            <div className={styles.cardTopRow}>
              <div className={styles.kicker}>Appel découverte gratuit</div>
              <div className={styles.phoneBadge} title="Appel découverte">
                <PhoneIcon />
              </div>
            </div>

            <h2 className={styles.h2}>On clarifie ton projet en 15 minutes</h2>
            <p className={styles.p}>
              Destination, dates, budget, niveau (Éco / Confort / Premium),
              contraintes : tu repars avec un cadrage net.
            </p>

            <div className={styles.actions}>
              <Link className={styles.primary} href="/appel-decouverte">
                Réserver un créneau
              </Link>
            </div>

            <div className={styles.micro}>
              Confirmation + invitation agenda envoyées automatiquement après
              réservation.
            </div>
          </div>
        </div>
      </section>

      {/* OFFRES (les vraies cards de /offres, scroll horizontal) */}
      <div className={styles.section}>
        <OffersPreviewFromOffres />
      </div>

      {/* DOCUMENTS & CARNETS */}
      <div className={styles.section} id="documents">
        <DocumentsPreview />
      </div>

      {/* FAQ */}
      <div className={styles.section} id="faq">
        <FAQ />
      </div>

      {/* ABOUT */}
      <div className={styles.section} id="traveltactik">
        <AboutSection />
      </div>
    </>
  );
}
