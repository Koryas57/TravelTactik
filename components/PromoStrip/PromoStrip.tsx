import Image from "next/image";
import styles from "./PromoStrip.module.scss";

type Props = {
  title?: string;
  subtitle?: string;
  imageSrc: string; // "/images/..." ou URL distante (si configurée)
};

export function PromoStrip({
  title = "Inspiration + méthode = économies réelles",
  subtitle = "Je te propose 3 stratégies (Éco / Confort / Premium) + une check-list simple pour réserver vite et bien.",
  imageSrc,
}: Props) {
  return (
    <section className={styles.wrap} aria-label="Inspiration voyage">
      <div className={styles.media}>
        <Image
          src={imageSrc}
          alt=""
          fill
          priority={false}
          sizes="(max-width: 900px) 100vw, 1100px"
          className={styles.img}
        />
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.sub}>{subtitle}</p>

          <div className={styles.actions}>
            <a className={styles.primary} href="#brief">
              Modifier mon brief
            </a>
            <a className={styles.secondary} href="#offres">
              Voir le livrable
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
