"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./TravelBookletGallery.module.scss";

type Booklet = {
  id: string;
  title: string;
  subtitle?: string;
  cover: { src: string; alt: string };
  pages: ReadonlyArray<{ src: string; alt: string }>;
  tag?: string; // ex: "Polynésie", "New York", etc.
};

type Props = {
  items: Booklet[];
  kicker?: string;
  title?: string;
  moreHref?: string;
  moreLabel?: string;
};

export function TravelBookletGallery({
  items,
  kicker = "Exemples de carnets",
  title = "Aperçu (clique pour feuilleter)",
  moreHref,
  moreLabel = "En savoir plus →",
}: Props) {
  const [open, setOpen] = useState(false);
  const [bookletIndex, setBookletIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const active = useMemo(() => items[bookletIndex], [items, bookletIndex]);
  const pages = active?.pages ?? [];
  const currentPage = pages[pageIndex];

  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  const openBooklet = (idx: number) => {
    setBookletIndex(idx);
    setPageIndex(0);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const prev = () => setPageIndex((p) => (p <= 0 ? pages.length - 1 : p - 1));
  const next = () => setPageIndex((p) => (p >= pages.length - 1 ? 0 : p + 1));

  // Keyboard
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pages.length]);

  // Focus + scroll lock
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // focus close button for accessibility
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Touch swipe (simple)
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;

    // swipe horizontal only
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) prev();
    else next();
  };

  return (
    <div className={styles.wrap} aria-label="Exemples de carnets de voyage">
      <div className={styles.head}>
        <div className={styles.kicker}>{kicker}</div>
        <div className={styles.h3}>{title}</div>
      </div>

      <div className={styles.grid}>
        {items.map((b, idx) => (
          <button
            key={b.id}
            type="button"
            className={styles.card}
            onClick={() => openBooklet(idx)}
            aria-label={`Ouvrir le carnet : ${b.title}`}
          >
            <div className={styles.thumb}>
              <Image
                src={b.cover.src}
                alt={b.cover.alt}
                fill
                sizes="(max-width: 860px) 46vw, 220px"
                className={styles.thumbImg}
                priority={idx < 2}
              />
              {b.tag ? <div className={styles.tag}>{b.tag}</div> : null}
            </div>

            <div className={styles.meta}>
              <div className={styles.title}>{b.title}</div>
              {b.subtitle ? (
                <div className={styles.subtitle}>{b.subtitle}</div>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <div className={styles.headRow}>
        {moreHref ? (
          <a className={styles.more} href={moreHref}>
            {moreLabel}
          </a>
        ) : null}
      </div>
      {open && currentPage ? (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label="Visualiseur de carnet"
          onMouseDown={(e) => {
            // close only if click on backdrop
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className={styles.viewer}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              ref={closeBtnRef}
              className={styles.close}
              onClick={close}
              aria-label="Fermer"
              title="Fermer (Esc)"
            >
              ✕
            </button>

            <button
              type="button"
              className={styles.navLeft}
              onClick={prev}
              aria-label="Page précédente"
              title="Précédent (←)"
            >
              ‹
            </button>

            <button
              type="button"
              className={styles.navRight}
              onClick={next}
              aria-label="Page suivante"
              title="Suivant (→)"
            >
              ›
            </button>

            <div className={styles.topBar}>
              <div className={styles.topTitle}>
                {active.title}
                {active.subtitle ? (
                  <span className={styles.topSubtitle}>
                    {" "}
                    ➜ {active.subtitle}
                  </span>
                ) : null}
              </div>
              <div className={styles.counter}>
                {pageIndex + 1}/{pages.length}
              </div>
            </div>

            <div className={styles.stage}>
              <Image
                src={currentPage.src}
                alt={currentPage.alt}
                fill
                sizes="100vw"
                className={styles.stageImg}
                priority
              />
            </div>

            <div className={styles.hint}>
              Swipe, flèches, ou ESC pour fermer.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
