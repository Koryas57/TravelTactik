"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import styles from "./Login.module.scss";

export function LoginClient() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/app";

  function onGoogle() {
    // Redirige vers Google, puis revient sur callbackUrl
    void signIn("google", { callbackUrl });
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>Connexion</h1>
      <p className={styles.sub}>
        Accède à ton espace pour retrouver tes plans et documents.
      </p>

      <button className={styles.googleBtn} type="button" onClick={onGoogle}>
        Continuer avec Google
      </button>

      <p className={styles.small}>
        En continuant, tu acceptes nos conditions et notre politique de
        confidentialité.
      </p>
    </div>
  );
}
