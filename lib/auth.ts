import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

/**
 * Full auth config with PrismaAdapter + JWT strategy.
 * Only imported in server components and API routes (Node runtime).
 * Middleware imports auth.config.ts directly (Edge-safe).
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
});
