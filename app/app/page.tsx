import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";
import style from "../../components/Plans/PlanCard.module.scss";

export default async function AppHome() {
  const session = await getServerSession(authOptions);

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <h1> Mon Espace Client 🧭</h1>
      <p style={{ color: "var(--tt-muted)" }}>
        Connecté(e) en tant que : <strong>{session?.user?.email ?? "—"}</strong>
      </p>

      <div className={style.mySpaceNav}>
        <Link href="/app/plans">➡️ Mes plans de voyage 🗺️</Link>
        <Link href="/app/synthese-et-devis">➡️ Synthèse et Devis 📃</Link>
        <Link href="/app/profil">➡️ Mon profil 🪪</Link>
        <Link href="/app/favorites">➡️ Mes favoris ⭐</Link>
      </div>
    </main>
  );
}

// Ajouter une systeme de notifications ou messages récents
