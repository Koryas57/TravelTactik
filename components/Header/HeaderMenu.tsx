"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./HeaderMenu.module.scss";
import { GoogleIcon } from "../icons/GoogleIcon";

type Props = {
  openCheckout?: () => void; // CTA
};

type NavItem = { label: string; href: string };

export function HeaderMenu({ openCheckout }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const { status } = useSession();
  const authed = status === "authenticated";

  const pathname = usePathname();

  function getCurrentUrlSafe() {
    if (typeof window === "undefined") return pathname || "/";
    return (
      window.location.pathname + window.location.search + window.location.hash
    );
  }

  const isHome = pathname === "/";
  const hideLogin = pathname === "/login";

  const navItems: NavItem[] = useMemo(() => {
    if (isHome) {
      return [
        { label: "Brief", href: "/#brief" },
        { label: "Offres", href: "/#scenarios" },
        { label: "FAQ", href: "/#faq" },
      ];
    }
    return [{ label: "Accueil", href: "/" }];
  }, [isHome]);

  function close() {
    setOpen(false);
  }

  // ESC closes
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // focus first actionable element
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    el?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.burger}
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={styles.burgerLines} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className={styles.backdrop}
            onClick={close}
            aria-label="Fermer"
          />

          <div className={styles.panel} ref={panelRef}>
            <div className={styles.top}>
              <span className={styles.logoDot} aria-hidden="true" />
              <div className={styles.panelTitle}>Travel Tactik</div>
              <button
                type="button"
                className={styles.close}
                onClick={close}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Navigation</div>
              <div className={styles.links}>
                {navItems.map((it) => (
                  <Link
                    key={it.href}
                    className={styles.link}
                    href={it.href}
                    onClick={close}
                  >
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>

            {openCheckout ? (
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    close();
                    openCheckout();
                  }}
                >
                  Obtenir mon plan
                </button>
              </div>
            ) : null}

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Espace client</div>

              {status === "loading" ? (
                <div className={styles.muted}>Chargement…</div>
              ) : authed ? (
                <div className={styles.links}>
                  <Link className={styles.link} href="/app" onClick={close}>
                    Mon espace
                  </Link>
                  <Link
                    className={styles.link}
                    href="/app/plans"
                    onClick={close}
                  >
                    Mes plans
                  </Link>
                  <Link
                    className={styles.link}
                    href="/app/profile"
                    onClick={close}
                  >
                    Mon profil
                  </Link>
                  <Link
                    className={styles.link}
                    href="/app/favorites"
                    onClick={close}
                  >
                    Mes favoris
                  </Link>

                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Se déconnecter
                  </button>
                </div>
              ) : (
                <div className={styles.links}>
                  {!hideLogin ? (
                    <Link
                      className={styles.googleBtn}
                      href={`/login?callbackUrl=${encodeURIComponent(getCurrentUrlSafe())}`}
                      onClick={close}
                    >
                      <span className={styles.googleIcon} aria-hidden="true">
                        <GoogleIcon size={22} />
                      </span>
                      Continuer avec Google
                    </Link>
                  ) : (
                    <div className={styles.muted}>Connexion</div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.bottomNote}>
              TravelTactik — conseil & optimisation de voyage
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
