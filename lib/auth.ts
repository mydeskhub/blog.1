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
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
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
      clientSecret: process.env.AUTH_TWITTER_SECRET ?? "",
      authorization: {
        params: {
          scope: "users.read tweet.read offline.access"
        }
      },
      profile(rawProfile) {
        const profile = (rawProfile as { data?: Record<string, unknown> }).data ?? (rawProfile as Record<string, unknown>);
        const id = profile?.id;

        if (!id) {
          // Safe diagnostic log: useful for callback parsing issues without leaking secrets/tokens.
          console.error("[auth][twitter] profile parse failed", {
            profileKeys: Object.keys(profile ?? {}),
            rawKeys: Object.keys((rawProfile as Record<string, unknown>) ?? {})
          });
          throw new Error("Twitter profile payload missing id");
        }

        return {
          id: String(id),
          name: String(profile.name ?? profile.username ?? "Twitter User"),
          email: null,
          image: (profile.profile_image_url as string | undefined) ?? null
        };
      }
    })
  ],
  logger: {
    error(code, metadata) {
      console.error("[auth][logger][error]", code, metadata);
    },
    warn(code) {
      console.warn("[auth][logger][warn]", code);
    }
  },
  events: {
    async signIn(message) {
      console.info("[auth][event][signIn]", {
        userId: message.user.id,
        provider: message.account?.provider
      });
    }
  },
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
