import { LegalLayout } from "../../components/Legal/LegalLayout";

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales">
      <p>
        TravelTactik propose un service de conseil en organisation et
        optimisation de voyages (recommandations, itinéraires, check-lists). Le
        site ne vend pas de billets ni de réservations en tant qu’agence de
        voyage.
      </p>

      <h2>Éditeur du site</h2>
      <p>
        TravelTactik
        <br />
        Contact :{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>
      </p>

      <h2>Hébergement</h2>
      <p>Le site est hébergé par Vercel Inc.</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus (textes, structure, marque) sont protégés. Toute
        reproduction non autorisée est interdite.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Les recommandations sont fournies selon les informations transmises par
        l’utilisateur. L’utilisateur reste responsable de ses réservations, et
        des vérifications nécessaires (documents, visa, santé, assurances).
      </p>
    </LegalLayout>
  );
}
