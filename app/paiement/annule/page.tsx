import Link from "next/link";

export default function PaiementAnnulePage() {
  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <h1>Paiement annulé</h1>
      <p>Aucun paiement n’a été effectué. Tu peux réessayer quand tu veux.</p>
      <Link href="/">Retour à l’accueil</Link>
    </main>
  );
}
