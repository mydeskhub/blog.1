import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";

const secret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "").trim() || undefined;

/**
 * Edge-safe auth config. Imported by middleware.ts (runs on Edge runtime).
 * Must NOT import Prisma, database adapters, or Node-only modules.
 *
 * Also imported by lib/auth.ts (Node runtime) which adds PrismaAdapter.
 * Both instances must share the same secret, session strategy, and cookie
 * config so that state/PKCE cookies set during OAuth redirect can be
 * decrypted on callback.
 */
export const authConfig: NextAuthConfig = {
  secret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID ?? "",
      clientSecret: process.env.AUTH_TWITTER_SECRET ?? "",
      // Twitter API v2 wraps the profile in a `data` envelope.
      profile(rawProfile) {
        const profile =
          (rawProfile as { data?: Record<string, unknown> }).data ??
          (rawProfile as Record<string, unknown>);
        const id = profile?.id;

        if (!id) {
          console.error("[auth][twitter] profile parse failed", {
            profileKeys: Object.keys(profile ?? {}),
            rawKeys: Object.keys((rawProfile as Record<string, unknown>) ?? {}),
          });
          throw new Error("Twitter profile payload missing id");
        }

        return {
          id: String(id),
          name: String(profile.name ?? profile.username ?? "Twitter User"),
          email: null,
          image: (profile.profile_image_url as string | undefined) ?? null,
        };
      },
    }),
  ],
  cookies: {
    // Explicit cookie config ensures state/PKCE survive cross-site OAuth redirects.
    // sameSite "lax" is the minimum needed — "none" would also work but leaks cookies
    // to all cross-site requests. "lax" only sends on top-level GET navigations,
    // which is exactly what OAuth callbacks are.
    state: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.state"
          : "authjs.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.pkce.code_verifier"
          : "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      if (pathname.startsWith("/dashboard")) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.platformRole = user.platformRole ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.platformRole = token.platformRole;
      }
      return session;
    },
  },
};
