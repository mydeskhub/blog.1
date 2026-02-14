import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Middleware uses the Edge-safe auth config only.
 * PrismaAdapter is NOT imported here — it would crash the Edge runtime.
 * The `authorized` callback in auth.config.ts handles route protection.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/posts/:path*",
    "/api/upload/:path*",
    "/api/comments/:path*",
    "/api/claps/:path*",
    "/api/teams/:path*",
    "/api/ai/:path*",
  ],
};
