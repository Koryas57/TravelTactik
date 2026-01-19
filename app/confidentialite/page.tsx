import { LegalLayout } from "../../components/Legal/LegalLayout";

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données sont collectées via
        TravelTactik, pourquoi, et comment exercer vos droits.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li>Adresse email</li>
        <li>Informations de brief (destination, durée, budget, etc.)</li>
        <li>Notes optionnelles</li>
        <li>Données techniques minimales (user-agent, logs anti-abus)</li>
      </ul>

      <h2>Finalités</h2>
      <ul>
        <li>Traiter la demande et recontacter l’utilisateur</li>
        <li>Produire une recommandation / un plan de voyage</li>
        <li>Prévenir les abus (spam, fraude)</li>
      </ul>

      <h2>Base légale</h2>
      <p>
        Traitement fondé sur l’intérêt légitime et/ou les mesures
        précontractuelles nécessaires à la réponse à votre demande.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données sont conservées le temps nécessaire au traitement de la
        demande, puis supprimées/archivées dans un délai raisonnable (par
        exemple 12 mois), sauf obligation légale ou relation contractuelle.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li>Vercel (hébergement)</li>
        <li>Neon (base de données PostgreSQL)</li>
        <li>Resend (envoi d’emails transactionnels)</li>
      </ul>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification ou la suppression de vos
        données en écrivant à{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
