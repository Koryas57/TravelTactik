import { LegalLayout } from "../../components/Legal/LegalLayout";

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données sont collectées via
        TravelTactik, pourquoi, et comment exercer vos droits.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        TravelTactik (contact :{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>).
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>Adresse email</li>
        <li>
          Informations de brief (destination, durée, voyageurs, budget, etc.)
        </li>
        <li>Notes optionnelles</li>
        <li>
          Données techniques minimales liées à la sécurité et au diagnostic (ex
          : user-agent, logs anti-abus)
        </li>
      </ul>

      <h2>Finalités</h2>
      <ul>
        <li>Traiter votre demande et vous recontacter</li>
        <li>Produire une recommandation / un plan de voyage</li>
        <li>
          Assurer la sécurité du service et prévenir les abus (spam, fraude)
        </li>
      </ul>

      <h2>Base légale</h2>
      <ul>
        <li>
          <strong>Mesures précontractuelles</strong> : traitement nécessaire à
          la réponse à votre demande.
        </li>
        <li>
          <strong>Intérêt légitime</strong> : prévention des abus et sécurité du
          service.
        </li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données sont conservées le temps nécessaire au traitement de la
        demande, puis supprimées ou archivées dans un délai maximum de{" "}
        <strong>12 mois</strong> à compter du dernier échange, sauf obligation
        légale ou relation contractuelle ultérieure.
      </p>

      <h2>Destinataires et sous-traitants</h2>
      <p>
        Les données sont traitées par TravelTactik et ses prestataires
        techniques nécessaires au fonctionnement du service :
      </p>
      <ul>
        <li>Vercel (hébergement)</li>
        <li>Neon (base de données PostgreSQL)</li>
        <li>Resend (envoi d’emails transactionnels)</li>
      </ul>

      <h2>Transferts hors Union européenne</h2>
      <p>
        Selon la configuration des prestataires, certaines données peuvent être
        traitées hors de l’Union européenne. Dans ce cas, les transferts sont
        encadrés par des mécanismes reconnus (ex : clauses contractuelles types)
        afin de protéger les données.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification, l’effacement, la
        limitation ou l’opposition au traitement, ainsi que la portabilité
        lorsque applicable, en écrivant à{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>.
      </p>

      <h2>Réclamation</h2>
      <p>
        Vous pouvez également déposer une réclamation auprès de la CNIL
        (Commission Nationale de l’Informatique et des Libertés).
      </p>
    </LegalLayout>
  );
}
