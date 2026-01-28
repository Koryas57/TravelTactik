import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth";

export default async function AppHome() {
  const session = await getServerSession(authOptions);

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <h1>Mon espace</h1>
      <p style={{ color: "var(--tt-muted)" }}>
        Connecté en tant que <strong>{session?.user?.email ?? "—"}</strong>
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <Link href="/app/plans">Mes plans de voyage</Link>
        <Link href="/app/profile">Mon profil</Link>
        <Link href="/app/favorites">Mes favoris</Link>
      </div>
    </main>
  );
}

// Mon espace à terminer avec le header et le footer
// Ajouter un lien de déconnexion
// Afficher l'email de l'utilisateur connecté
// Ajouter des styles pour rendre la page plus attrayante, card de navigation avec icônes vers les différentes sections (plans de voyage, profil, favoris, etc.)
// Utiliser des icônes pour chaque lien de navigation sur mobile
// Ajouter une section pour les notifications ou messages récents
// Ajouter un lien vers les paramètres du compte (Mon profil)
// Ajouter un lien vers l'aide ou le support client
