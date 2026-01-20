import Link from "next/link";
import { Header } from "../../../components/Header/Header";

export default function PaiementSuccesPage() {
  return (
    <>
      <Header showNav={false} showCta={false} />
      <main className="container" style={{ padding: "32px 0" }}>
        <h1>Paiement confirmé</h1>
        <p>
          Félicitations ! Ta demande est bien enregistrée. Je reviens vers toi
          par email au plus vite.
        </p>
        <Link href="/">Retour à l’accueil</Link>
      </main>
    </>
  );
}
