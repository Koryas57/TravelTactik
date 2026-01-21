"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";

type Props = {
  classNameLogin?: string;
  classNameApp?: string;
  classNameLogout?: string;
};

export function HeaderAuthActions({
  classNameLogin,
  classNameApp,
  classNameLogout,
}: Props) {
  const { status } = useSession();
  const pathname = usePathname();
  const search = useSearchParams();

  const qs = search?.toString();
  const currentUrl = qs ? `${pathname}?${qs}` : pathname;

  if (status === "loading") {
    // évite le flicker; on ne rend rien tant qu'on ne sait pas
    return null;
  }

  if (status !== "authenticated") {
    return (
      <Link
        className={classNameLogin}
        href={`/login?callbackUrl=${encodeURIComponent(currentUrl)}`}
      >
        Se connecter
      </Link>
    );
  }

  return (
    <>
      <Link className={classNameApp} href="/app">
        Mon espace
      </Link>
      <button
        className={classNameLogout}
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Se déconnecter
      </button>
    </>
  );
}
