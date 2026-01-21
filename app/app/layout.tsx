import type { ReactNode } from "react";
import { Header } from "../../components/Header/Header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* On garde le header global, mais sans CTA checkout.
         Ici on veut surtout "Retour au site" + burger/menu */}
      <Header showNav={false} showCta={false} />

      <main className="container" style={{ padding: "24px 0" }}>
        {children}
      </main>
    </>
  );
}
