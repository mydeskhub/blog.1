import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";

/**
 * Edge-safe auth config. Imported by middleware.ts (runs on Edge runtime).
 * Must NOT import Prisma, database adapters, or Node-only modules.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
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
    }),
  ],
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
