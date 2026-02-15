import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware — no NextAuth instance.
 *
 * Creating a second NextAuth() in middleware was the root cause of the
 * "InvalidCheck: state value could not be parsed" error.  Two instances
 * can compute different cookie names / salts (Edge vs Node URL protocol,
 * NODE_ENV vs url.protocol for __Secure- prefix) which makes the state
 * cookie unreadable on the OAuth callback.
 *
 * This middleware only checks whether a session-token cookie exists and
 * redirects unauthenticated visitors to /signin.  The real JWT
 * verification happens server-side in the dashboard layout (auth()) and
 * in API routes (requireUser()).
 */
export function middleware(request: NextRequest) {
  // next-auth v5 names: authjs.session-token (dev) / __Secure-authjs.session-token (prod)
  const hasSession = request.cookies.getAll().some((c) =>
    c.name.endsWith("authjs.session-token"),
  );

  if (!hasSession) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
