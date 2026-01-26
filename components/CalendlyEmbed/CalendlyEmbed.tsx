"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CalendlyEmbed.module.scss";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: {
          name?: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          customAnswers?: Record<string, string>;
        };
      }) => void;
    };
  }
}

type Prefill = {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  customAnswers?: Record<string, string>;
};

type Props = {
  url: string;
  height?: number;
  prefill?: Prefill;
  title?: string;
};

function loadCalendlyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();

    // Déjà chargé ?
    if (window.Calendly?.initInlineWidget) return resolve();

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-calendly="widget"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Calendly script load failed")),
      );
      return;
    }

    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.dataset.calendly = "widget";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Calendly script load failed"));
    document.body.appendChild(s);
  });
}

export function CalendlyEmbed({ url, height = 720, prefill, title }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const normalizedUrl = useMemo(() => url?.trim(), [url]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setErr(null);
      if (!normalizedUrl) {
        setErr("Calendly URL manquante (NEXT_PUBLIC_CALENDLY_URL).");
        return;
      }

      try {
        await loadCalendlyScript();
        if (cancelled) return;

        const el = hostRef.current;
        if (!el) return;

        // Clear + re-init (utile si prefill change)
        el.innerHTML = "";

        if (!window.Calendly?.initInlineWidget) {
          setErr("Calendly n’est pas disponible.");
          return;
        }

        window.Calendly.initInlineWidget({
          url: normalizedUrl,
          parentElement: el,
          prefill,
        });
      } catch (e) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Erreur Calendly");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [normalizedUrl, prefill]);

  return (
    <div className={styles.wrap} aria-label={title ?? "Calendrier"}>
      {err ? <div className={styles.error}>{err}</div> : null}
      <div className={styles.embed} style={{ height }}>
        <div ref={hostRef} className={styles.host} />
      </div>
    </div>
  );
}
