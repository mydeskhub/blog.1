import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import { db } from "@/lib/db";

const resolvedSecret = (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "").trim();
if (!process.env.AUTH_SECRET && resolvedSecret) {
  process.env.AUTH_SECRET = resolvedSecret;
}

export const authConfig: NextAuthConfig = {
  secret: resolvedSecret || undefined,
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  pages: {
    signIn: "/signin"
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? ""
    }),
    Twitter({
      clientId: process.env.AUTH_TWITTER_ID ?? "",
      clientSecret: process.env.AUTH_TWITTER_SECRET ?? ""
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.platformRole = (user as { platformRole?: "USER" | "ADMIN" }).platformRole ?? "USER";
      }
      return session;
    }
  }
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
