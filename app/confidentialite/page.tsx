export const dynamic = "force-dynamic";

import { LegalLayout } from "../../components/Legal/LegalLayout";

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        Cette politique explique quelles données sont collectées via Travel
        Tactik, pourquoi, et comment exercer vos droits.
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        <strong>Yacine Nezreg</strong> – Entrepreneur individuel (Travel Tactik)
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

      <h2>Données collectées</h2>
      <ul>
        <li>Adresse email</li>
        <li>
          Informations de brief (destination, durée, voyageurs, budget, etc.)
        </li>
        <li>Notes optionnelles</li>
        <li>
          Données techniques minimales liées à la sécurité et au diagnostic (ex
          : adresse IP, user-agent, horodatage, logs anti-abus)
        </li>
      </ul>

      <h2>Données liées aux commandes et paiements</h2>
      <p>
        Lorsque vous achetez une prestation, des données nécessaires à
        l’exécution du contrat et à la facturation peuvent être traitées
        (coordonnées, informations de facturation, preuve de paiement). Les
        données de carte bancaire ne sont pas traitées par Travel Tactik : elles
        sont traitées par le prestataire de paiement.
      </p>

      <h2>Finalités</h2>
      <ul>
        <li>Traiter votre demande et vous recontacter</li>
        <li>Produire une recommandation / un plan de voyage</li>
        <li>Exécuter la prestation commandée et assurer la facturation</li>
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
          <strong>Exécution du contrat</strong> : fourniture des prestations et
          livrables commandés.
        </li>
        <li>
          <strong>Obligation légale</strong> : gestion de la facturation et
          conservation des pièces comptables lorsque applicable.
        </li>
        <li>
          <strong>Intérêt légitime</strong> : prévention des abus et sécurité du
          service.
        </li>
      </ul>

      <h2>Durée de conservation</h2>
      <ul>
        <li>
          Données de demande / brief : conservées le temps nécessaire au
          traitement, puis supprimées ou archivées dans un délai maximum de{" "}
          <strong>12 mois</strong> à compter du dernier échange, sauf relation
          contractuelle ultérieure ou obligation légale.
        </li>
        <li>
          Données liées aux commandes, facturation et preuves de paiement :
          conservées pendant la durée nécessaire au respect des obligations
          légales et à la gestion des éventuels litiges (notamment obligations
          comptables).
        </li>
        <li>
          Logs de sécurité : conservés pour une durée limitée et proportionnée
          (par exemple <strong>12 mois</strong>), sauf nécessité particulière
          liée à la sécurité ou à la prévention de la fraude.
        </li>
      </ul>

      <h2>Destinataires et sous-traitants</h2>
      <p>
        Les données sont traitées par Travel Tactik et ses prestataires
        techniques nécessaires au fonctionnement du service :
      </p>
      <ul>
        <li>Vercel (hébergement)</li>
        <li>Neon (base de données PostgreSQL)</li>
        <li>Resend (envoi d’emails transactionnels)</li>
        <li>Stripe (paiements)</li>
        <li>Calendly (prise de rendez-vous, si utilisé)</li>
      </ul>

      <h2>Transferts hors Union européenne</h2>
      <p>
        Selon la configuration et la localisation des prestataires, certaines
        données peuvent être traitées hors de l’Union européenne (notamment via
        des prestataires établis aux États-Unis). Lorsque cela s’applique, les
        transferts sont encadrés par des mécanismes reconnus (ex : clauses
        contractuelles types) afin de protéger les données.
      </p>

      <h2>Cookies et traceurs</h2>
      <p>
        Le site peut utiliser des traceurs strictement nécessaires à son
        fonctionnement et à sa sécurité, ainsi qu’un outil de mesure d’audience
        (Vercel Analytics). Certaines pages peuvent intégrer des services tiers
        (ex : prise de rendez-vous via Calendly) susceptibles de déposer des
        cookies dans le cadre de leur propre fonctionnement. Le cas échéant, les
        mécanismes d’information/consentement peuvent être fournis par ces
        services intégrés. Cette section sera mise à jour en cas d’ajout
        d’autres traceurs.
      </p>

      <h2>Sécurité</h2>
      <p>
        Des mesures techniques et organisationnelles raisonnables sont mises en
        œuvre pour protéger les données (contrôles d’accès, chiffrement des
        communications, journalisation anti-abus et mesures de prévention).
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification, l’effacement, la
        limitation ou l’opposition au traitement, ainsi que la portabilité
        lorsque applicable, en écrivant à{" "}
        <a href="mailto:traveltactik@gmail.com">traveltactik@gmail.com</a>. Une
        réponse est apportée dans un délai maximum de <strong>30 jours</strong>{" "}
        à compter de la réception de la demande (sous réserve de vérification
        d’identité en cas de doute raisonnable).
      </p>

      <h2>Réclamation</h2>
      <p>
        Vous pouvez également déposer une réclamation auprès de la CNIL
        (Commission Nationale de l’Informatique et des Libertés).
      </p>

      <h2>Mise à jour</h2>
      <p>
        Cette politique peut être modifiée afin de refléter les évolutions du
        service ou des obligations applicables. La version en ligne est la
        version en vigueur.
      </p>
    </LegalLayout>
  );
}
