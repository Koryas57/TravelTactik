import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="TravelTactik Admin"',
    },
  });
}

function decodeBasicAuth(
  authHeader: string,
): { user: string; pass: string } | null {
  if (!authHeader.startsWith("Basic ")) return null;

  const base64 = authHeader.slice("Basic ".length).trim();

  let decoded = "";
  try {
    // Edge runtime: atob est dispo
    decoded = atob(base64);
  } catch {
    return null;
  }

  // Important: le password peut contenir ":" -> split au 1er ":"
  const idx = decoded.indexOf(":");
  if (idx === -1) return null;

  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  return { user, pass };
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protège /admin et /api/admin
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_BASIC_USER;
  const expectedPass = process.env.ADMIN_BASIC_PASS;
  if (!expectedUser || !expectedPass) return unauthorized();

  const auth = req.headers.get("authorization");
  if (!auth) return unauthorized();

  const creds = decodeBasicAuth(auth);
  if (!creds) return unauthorized();

  if (creds.user !== expectedUser || creds.pass !== expectedPass) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
