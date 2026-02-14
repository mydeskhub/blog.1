import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

/**
 * Full auth config with PrismaAdapter.
 * Session strategy (jwt), secret, cookies, and providers all come from
 * auth.config.ts so that the middleware NextAuth instance and this one
 * produce identical cookie signatures.
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
});
