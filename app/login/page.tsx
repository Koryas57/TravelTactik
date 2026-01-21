export const dynamic = "force-dynamic";

import { Header } from "../../components/Header/Header";
import { LoginClient } from "../../components/Login/LoginClient";

export default function LoginPage() {
  return (
    <>
      <Header showNav={false} showCta={false} />
      <main className="container" style={{ padding: "32px 0" }}>
        <LoginClient />
      </main>
    </>
  );
}
