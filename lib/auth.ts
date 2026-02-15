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
  debug: process.env.NODE_ENV !== "production",
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
      profile(profile) {
        // Twitter API v2 wraps the user data in a `data` field.
        // Handle both `{ data: { id, ... } }` and flat `{ id, ... }` shapes.
        const raw = profile as unknown as Record<string, unknown>;
        const data = (raw.data as Record<string, string> | undefined) ?? raw;
        return {
          id: String(data.id),
          name: String(data.name ?? ""),
          email: data.email ? String(data.email) : null,
          image: typeof data.profile_image_url === "string"
            ? data.profile_image_url.replace("_normal", "")
            : null,
        };
      },
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
