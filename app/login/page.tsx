// app/login/page.tsx
export const dynamic = "force-dynamic";

import { Header } from "../../components/Header/Header";
import { LoginClient } from "../../components/Login/LoginClient";

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function LoginPage({ searchParams }: Props) {
  const raw = searchParams?.callbackUrl;
  const callbackUrl =
    typeof raw === "string" && raw.trim().length > 0 ? raw : "/app";

  return (
    <>
      <Header showNav={false} showCta={false} />
      <main className="container" style={{ padding: "32px 0" }}>
        <LoginClient callbackUrl={callbackUrl} />
      </main>
    </>
  );
}
