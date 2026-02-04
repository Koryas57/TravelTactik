export const dynamic = "force-dynamic";

import { LegalLayout } from "../../components/Legal/LegalLayout";

export default function CgvPage() {
  return (
    <LegalLayout title="Conditions Générales de Vente (CGV)">
      <p>
        Dernière mise à jour : <strong>04/02/2026</strong>
      </p>

      <h2>1. Objet</h2>
      <p>
        Les présentes Conditions Générales de Vente (“CGV”) définissent les
        modalités de vente des prestations de <strong>Travel Tactik</strong>,
        consistant en du{" "}
        <strong>conseil en organisation et optimisation de voyages</strong>
        (analyse, arbitrages, recommandations, itinéraires, check-lists et
        livrables PDF), ainsi que l’option “carnet de voyage” lorsque souscrite.
      </p>

      <h2>2. Identité du vendeur</h2>
      <p>
        <strong>Travel Tactik</strong> — Exploitant :{" "}
        <strong>Yacine Nezreg</strong>, Entrepreneur individuel
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

      <h2>3. Description des prestations</h2>
      <p>
        Travel Tactik propose des prestations de conseil sur-mesure. Le client
        reste <strong>entièrement décisionnaire</strong> et effectue lui-même
        ses réservations auprès des prestataires (compagnies aériennes, hôtels,
        etc.).
      </p>
      <ul>
        <li>
          <strong>Appel découverte gratuit</strong> : entretien d’environ{" "}
          <strong>30 minutes</strong> (via rendez-vous planifié), destiné à
          comprendre le besoin et qualifier la demande. Cet appel ne constitue
          pas une prestation payante.
        </li>
        <li>
          <strong>Prestation de conseil (20 € / jour de voyage)</strong> :
          élaboration d’un plan cohérent selon le besoin (Éco / Confort /
          Premium), incluant une sélection d’options (vols/hébergements), des
          alternatives, une logique de déplacements, et des recommandations
          utiles. Le livrable principal est un{" "}
          <strong>PDF “Tarifs & Liens”</strong> accessible dans l’Espace Client.
        </li>
        <li>
          <strong>Option Carnet de voyage (49 €)</strong> : livrable
          complémentaire sous forme de <strong>PDF “Carnet de Voyage”</strong>{" "}
          (itinéraire jour par jour, activités et timing recommandé, bonnes
          adresses, conseils pratiques, etc.), accessible dans l’Espace Client.
        </li>
      </ul>

      <h2>4. Processus de commande</h2>
      <ol>
        <li>
          Le client prend contact (rendez-vous ou formulaire) et échange son
          brief.
        </li>
        <li>
          À l’issue de l’échange, Travel Tactik transmet un récapitulatif du
          besoin et réalise une première phase d’analyse.
        </li>
        <li>
          Travel Tactik transmet ensuite un <strong>devis</strong> (accessible
          dans l’Espace Client), précisant le périmètre, le prix et les délais.
        </li>
        <li>
          La commande est réputée conclue à la{" "}
          <strong>validation du paiement</strong> via Stripe.
        </li>
      </ol>

      <h2>5. Prix</h2>
      <p>
        Les prix des prestations Travel Tactik sont indiqués en euros.
        <br />
        <strong>Prestation de conseil</strong> : 20 € / jour de voyage (selon la
        durée du voyage).
        <br />
        <strong>Option Carnet de voyage</strong> : 49 €.
      </p>
      <p>
        <strong>TVA</strong> : TVA non applicable, art. 293 B du CGI, sauf
        mention contraire sur facture.
      </p>

      <h2>6. Paiement</h2>
      <p>
        Le paiement s’effectue en une fois via <strong>Stripe</strong> (carte
        bancaire). La prestation débute après confirmation du paiement.
      </p>

      <h2>7. Délais de livraison</h2>
      <ul>
        <li>
          <strong>Devis</strong> : communiqué en principe dans un délai de{" "}
          <strong>3 jours ouvrés</strong> après réception d’un brief complet.
        </li>
        <li>
          <strong>PDF “Tarifs & Liens”</strong> (après paiement) : mise à
          disposition dans l’Espace Client en principe sous{" "}
          <strong>24 h ouvrées</strong>.
        </li>
        <li>
          <strong>PDF “Carnet de Voyage”</strong> (si option souscrite) : mise à
          disposition en principe sous <strong>3 jours ouvrés</strong> après
          stabilisation des choix et/ou confirmation par le client de la
          réservation des options retenues.
        </li>
      </ul>
      <p>
        Les délais sont indicatifs : ils peuvent varier selon la complexité de
        la demande, les contraintes (dates proches, multi-destinations) et la
        réactivité du client.
      </p>

      <h2>8. Validité des tarifs tiers (vols, hébergements, activités)</h2>
      <p>
        Les prix, disponibilités et conditions des prestataires tiers évoluent
        en permanence. Travel Tactik ne vend pas ces prestations et ne peut pas
        garantir le maintien d’un tarif ou d’une disponibilité après la
        transmission des liens.
      </p>
      <p>
        Sauf mention contraire dans le devis, les options proposées doivent être
        considérées comme <strong>valables quelques heures</strong> à partir de
        leur communication. Le client est invité à réserver rapidement s’il
        souhaite tenter de bénéficier du prix observé.
      </p>

      <h2>9. Révision / itération</h2>
      <p>
        Afin de permettre un ajustement raisonnable, le devis et/ou la
        proposition peut faire l’objet d’<strong>une (1) itération</strong>{" "}
        maximum (ex : ajustement si un prix a bougé ou si une option n’est plus
        disponible, dans la limite du périmètre initial).
      </p>

      <h2>10. Obligations du client</h2>
      <ul>
        <li>
          Fournir des informations exactes (dates, budget, contraintes,
          passeport, etc.).
        </li>
        <li>
          Effectuer lui-même ses réservations auprès des prestataires tiers.
        </li>
        <li>
          Vérifier les exigences nécessaires : documents, visas, formalités,
          santé/vaccins, assurances, sécurité, conditions tarifaires et
          d’annulation des prestataires.
        </li>
        <li>
          Confirmer à Travel Tactik les choix retenus lorsque nécessaire
          (notamment pour le carnet de voyage).
        </li>
      </ul>

      <h2>11. Droit de rétractation</h2>
      <p>
        Si le client est un consommateur et que la commande est conclue à
        distance, un droit de rétractation peut s’appliquer, sauf exceptions
        prévues par la loi.
      </p>
      <p>
        Compte tenu de la nature des prestations (contenus numériques et
        prestations personnalisées nécessitant une exécution rapide), le client
        peut être amené, lors du paiement, à :
      </p>
      <ul>
        <li>
          <strong>demander l’exécution immédiate</strong> de la prestation avant
          la fin du délai de rétractation, et
        </li>
        <li>
          <strong>reconnaître renoncer</strong> à son droit de rétractation une
          fois les contenus numériques (PDF) mis à disposition et/ou la
          prestation pleinement exécutée.
        </li>
      </ul>
      <p>
        Le client est informé que l’exercice effectif du droit de rétractation
        dépend notamment du statut (consommateur/professionnel) et des modalités
        d’exécution choisies au moment de la commande.
      </p>

      <h2>
        12. Absence de remboursement après exécution / accès aux livrables
      </h2>
      <p>
        À compter de la mise à disposition du{" "}
        <strong>PDF “Tarifs & Liens”</strong> dans l’Espace Client, la
        prestation est considérée comme exécutée (accès à un livrable
        personnalisé). Aucun remboursement n’est dû, sauf obligation légale
        contraire.
      </p>

      <h2>13. Rendez-vous et “no-show”</h2>
      <p>
        Le rendez-vous d’appel découverte est gratuit. En cas d’empêchement, le
        client est invité à reprogrammer via l’outil de prise de rendez-vous. En
        cas de “no-show” (absence non signalée), Travel Tactik se réserve la
        possibilité de limiter les reprogrammations à <strong>une (1)</strong>.
      </p>

      <h2>14. Responsabilité</h2>
      <p>
        Travel Tactik fournit une prestation de conseil. Les décisions finales
        et la réservation des prestations touristiques appartiennent au client.
        Travel Tactik ne saurait être tenu responsable : (i) des variations de
        prix et disponibilités, (ii) des conditions et actes des prestataires
        tiers, (iii) des annulations/modifications de vols, (iv) des exigences
        administratives ou sanitaires, (v) des événements de force majeure.
      </p>

      <h2>15. Propriété intellectuelle</h2>
      <p>
        Les livrables (PDF, structure, textes, sélection et organisation) sont
        protégés. Ils sont destinés à un usage personnel du client, pour le
        voyage concerné. Toute reproduction, diffusion ou revente sans
        autorisation est interdite.
      </p>

      <h2>16. Données personnelles</h2>
      <p>
        Les données personnelles sont traitées conformément à la politique de
        confidentialité :{" "}
        <a href="/confidentialite">www.travel-tactik.com/confidentialite</a>.
      </p>

      <h2>17. Droit applicable — litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige, les
        parties rechercheront une solution amiable avant toute action
        judiciaire.
      </p>
      <p>
        <strong>Médiation de la consommation</strong> : si le client est un
        consommateur, il peut recourir gratuitement à un médiateur de la
        consommation, conformément aux règles applicables.
        <br />
        Tavel Agnès - Coordonnées disponibles sur la page du médiateur{" "}
        <a href="https://www.mediateur-consommation-smp.fr/mediateur/agnes-tavel/">
          https://www.mediateur-consommation-smp.fr/mediateur/agnes-tavel/
        </a>
      </p>
    </LegalLayout>
  );
}
