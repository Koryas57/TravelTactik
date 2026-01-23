"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import styles from "./Login.module.scss";
import { GoogleIcon } from "../icons/GoogleIcon";

type Props = {
  callbackUrl: string;
};

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
            <GoogleIcon size={20} />
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
