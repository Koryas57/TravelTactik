import { LegalHeader } from "./LegalHeader";
import styles from "./Legal.module.scss";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, children }: Props) {
  return (
    <>
      <LegalHeader />
      <main className={styles.legalMain}>
        <div className={styles.legalContainer}>
          <h1 className={styles.h1}>{title}</h1>
          <div className={styles.content}>{children}</div>
        </div>
      </main>
    </>
  );
}
