import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.scss";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-label="Pied de page">
      <div className={styles.inner}>
        <div className={styles.colBrand}>
          <div className={styles.brand}>
            <span className={styles.brandLogo} aria-hidden="true">
              <Image
                src="/images/LogoTravel.png"
                alt="Logo TravelTactik"
                width={26}
                height={26}
              />
            </span>
            <span className={styles.brandName}>TRAVEL TACTIK</span>
          </div>

          <p className={styles.tagline}>
            Conseil de voyage sur-mesure : stratégie, arbitrages et itinéraires
            optimisés selon ton budget et ton confort.
          </p>
        </div>

        <div className={styles.col}>
          <div className={styles.title}>Liens</div>
          <div className={styles.links}>
            <Link href="/offres">Offres</Link>
            <Link href="/app">Mon Espace</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/appel-decouverte">Appel découverte gratuit</Link>
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.title}>Légal</div>
          <div className={styles.links}>
            <Link href="/appel-decouverte">Contact</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/cgv">Conditions générales</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© {year} TravelTactik</span>
          <span>
            Service de conseil uniquement : tu réserves directement auprès des
            prestataires.
          </span>
        </div>
      </div>
    </footer>
  );
}
