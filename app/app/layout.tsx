import type { ReactNode } from "react";
import { Header } from "../../components/Header/Header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header showCta={false} />

      <main className="container" style={{ padding: "24px 0" }}>
        {children}
      </main>
    </>
  );
}
