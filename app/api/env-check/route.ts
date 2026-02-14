import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";

function tryParseUrl(raw: string): { host: string | null; error: string | null } {
  try {
    return { host: new URL(raw).host, error: null };
  } catch (e) {
    return { host: null, error: e instanceof Error ? e.message : "Invalid URL" };
  }
}

export async function GET() {
  const authSecret = (process.env.AUTH_SECRET ?? "").trim();
  const nextAuthSecret = (process.env.NEXTAUTH_SECRET ?? "").trim();
  const databaseUrl = (process.env.DATABASE_URL ?? "").trim();
  const authUrl = (process.env.AUTH_URL ?? "").trim();
  const nextAuthUrl = (process.env.NEXTAUTH_URL ?? "").trim();

  // This is what NextAuth v5 createActionURL actually resolves
  const envUrl = authUrl || nextAuthUrl;

  const hdrs = await nextHeaders();

  return NextResponse.json({
    ok: true,
    checks: {
      hasDatabaseUrl: Boolean(databaseUrl),
      hasAuthSecret: Boolean(authSecret),
      hasNextAuthSecret: Boolean(nextAuthSecret),
      hasAuthUrl: Boolean(authUrl),
      hasNextAuthUrl: Boolean(nextAuthUrl),
      hasGoogleId: Boolean(process.env.AUTH_GOOGLE_ID),
      hasGoogleSecret: Boolean(process.env.AUTH_GOOGLE_SECRET),
      hasTwitterId: Boolean(process.env.AUTH_TWITTER_ID),
      hasTwitterSecret: Boolean(process.env.AUTH_TWITTER_SECRET)
    },
    urlDiag: {
      authUrl: authUrl ? tryParseUrl(authUrl) : "not set",
      nextAuthUrl: nextAuthUrl ? tryParseUrl(nextAuthUrl) : "not set",
      resolvedEnvUrl: envUrl || "none — will use headers",
      resolvedEnvUrlParse: envUrl ? tryParseUrl(envUrl) : "n/a",
      xForwardedHost: hdrs.get("x-forwarded-host") ?? null,
      xForwardedProto: hdrs.get("x-forwarded-proto") ?? null,
      host: hdrs.get("host") ?? null,
    },
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      vercelRegion: process.env.VERCEL_REGION ?? null,
      vercelUrl: process.env.VERCEL_URL ?? null,
      vercelDeploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null
    }
  });
}
