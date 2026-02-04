export const dynamic = "force-dynamic";

import { LegalLayout } from "../../components/Legal/LegalLayout";

export default function MentionsLegalesPage() {
  return (
    <LegalLayout title="Mentions légales">
      <p>
        Travel Tactik propose des prestations de conseil en organisation et
        optimisation de voyages (recommandations, itinéraires, check-lists et
        carnets de voyage). Le site ne vend pas de billets, ne réalise pas de
        réservations et n’encaisse aucune prestation touristique : le client
        réserve et paie directement auprès des prestataires de son choix.
      </p>

      <h2>Éditeur du site</h2>
      <p>
        <strong>Travel Tactik</strong>
        <br />
        Exploitant : <strong>Yacine Nezreg</strong> – Entrepreneur individuel
        <br />
        SIRET : <strong>988 707 378 00010</strong>
        <br />
        Adresse :{" "}
        <strong>
          117 Le Domaine de la Mer, 13960 Sausset-les-Pins, France
        </strong>
        <br />
        Contact :{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>
      </p>

      <h2>Responsable de la publication</h2>
      <p>
        <strong>Yacine Nezreg</strong>
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par <strong>Vercel Inc.</strong>
        <br />
        Adresse :{" "}
        <strong>
          Vercel Inc, 650 California St, San Francisco, CA 94108, US
        </strong>
        <br />
        Contact :{" "}
        <strong>
          <a href="mailto:legalnotices@vercel.com">legalnotices@vercel.com</a>
        </strong>
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Sauf mention contraire, l’ensemble des contenus présents sur le site
        (textes, structure, éléments de marque, graphismes) est protégé par le
        droit de la propriété intellectuelle. Toute reproduction, représentation
        ou exploitation non autorisée, totale ou partielle, est interdite.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Les informations et recommandations sont fournies à titre indicatif, sur
        la base des éléments communiqués par l’utilisateur, et peuvent évoluer
        (prix, disponibilités, conditions, réglementations, etc.). L’utilisateur
        demeure responsable de ses réservations et des vérifications nécessaires
        (documents d’identité, visas, formalités, santé, assurances, conditions
        des prestataires, sécurité, etc.).
      </p>

      <h2>Données personnelles</h2>
      <p>
        Pour toute question relative au traitement des données personnelles,
        vous pouvez contacter :{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>.
        <br />
        La politique de confidentialité est disponible ici :{" "}
        <a href="/confidentialite">www.travel-tactik.com/confidentialite</a>.
      </p>
    </LegalLayout>
  );
}
