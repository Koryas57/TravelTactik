import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function unauthorizedAdmin() {
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // =========================
  // 1) Admin (Basic Auth)
  // =========================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const expectedUser = process.env.ADMIN_BASIC_USER;
    const expectedPass = process.env.ADMIN_BASIC_PASS;
    if (!expectedUser || !expectedPass) return unauthorizedAdmin();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return unauthorizedAdmin();

    const creds = decodeBasicAuth(authHeader);
    if (!creds) return unauthorizedAdmin();

    if (creds.user !== expectedUser || creds.pass !== expectedPass) {
      return unauthorizedAdmin();
    }

    return NextResponse.next();
  }

  // =========================
  // 2) Client space (/app)
  // =========================
  if (pathname.startsWith("/app") || pathname.startsWith("/api/app")) {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      // si tu as oublié AUTH_SECRET, on force la connexion (plutôt que crash)
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      url.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(url);
    }

    // Edge-safe: lit le token NextAuth depuis les cookies
    const token = await getToken({ req, secret });

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      url.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/app/:path*",
    "/api/app/:path*",
  ],
};
