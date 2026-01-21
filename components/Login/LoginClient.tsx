"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import styles from "./Login.module.scss";

type Props = {
  callbackUrl: string;
};

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.622 32.91 29.2 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.843 1.154 7.962 3.038l5.657-5.657C34.98 6.053 29.748 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.93 12 24 12c3.059 0 5.843 1.154 7.962 3.038l5.657-5.657C34.98 6.053 29.748 4 24 4c-7.682 0-14.35 3.423-17.694 8.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.092 0 9.836-1.947 13.379-5.114l-6.19-5.238C29.127 35.09 26.686 36 24 36c-5.177 0-9.588-3.068-11.28-7.467l-6.522 5.025C9.505 40.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.06 12.06 0 0 1-4.114 5.648l.003-.002 6.19 5.238C36.957 39.265 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export function LoginClient({ callbackUrl }: Props) {
  const { status } = useSession();
  const authed = status === "authenticated";
  const loading = status === "loading";

  function onGoogle() {
    void signIn("google", { callbackUrl });
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>Me connecter à mon Espace Client</h1>
      <br />
      <p className={styles.sub}>
        Accèder à mon espace client pour retrouver mes plans de voyages,
        documents et offres enregistrées.
      </p>

      {loading ? (
        <div className={styles.muted}>Chargement…</div>
      ) : authed ? (
        <div>
          <p className={styles.muted}>Tu es déjà connecté.</p>
          <Link className={styles.primaryLink} href="/app">
            Aller à mon espace
          </Link>
        </div>
      ) : (
        <button className={styles.googleBtn} type="button" onClick={onGoogle}>
          <span className={styles.googleIcon} aria-hidden="true">
            <GoogleIcon />
          </span>
          Continuer avec Google
        </button>
      )}

      <p className={styles.small}>
        En continuant, tu acceptes nos{" "}
        <Link href="/mentions-legales">mentions légales</Link> et notre{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </div>
  );
}
