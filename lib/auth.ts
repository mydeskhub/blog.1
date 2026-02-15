import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import { db } from "@/lib/db";

/**
 * Single NextAuth instance — used by route handler, server components,
 * and API routes.  Middleware does NOT create its own instance.
 *
 * All cookie config uses next-auth defaults (derived from the request
 * URL protocol).  No custom cookie overrides — they caused salt
 * mismatches between the sign-in POST and OAuth callback GET.
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
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
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.platformRole =
          (user as { platformRole?: "USER" | "ADMIN" }).platformRole ?? "USER";
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
});
