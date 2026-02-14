import { handlers } from "@/lib/auth";

export const runtime = "nodejs";
export const { GET, POST } = handlers;

// Temporary diagnostics: verify secret is present at runtime.
if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  console.error("[auth][env] missing secret at runtime", {
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    vercelRegion: process.env.VERCEL_REGION ?? null
  });
}
