import { NextResponse } from "next/server";

export async function GET() {
  const authSecret = (process.env.AUTH_SECRET ?? "").trim();
  const nextAuthSecret = (process.env.NEXTAUTH_SECRET ?? "").trim();
  const databaseUrl = (process.env.DATABASE_URL ?? "").trim();
  const nextAuthUrl = (process.env.NEXTAUTH_URL ?? "").trim();

  return NextResponse.json({
    ok: true,
    checks: {
      hasDatabaseUrl: Boolean(databaseUrl),
      hasAuthSecret: Boolean(authSecret),
      hasNextAuthSecret: Boolean(nextAuthSecret),
      hasNextAuthUrl: Boolean(nextAuthUrl),
      hasGoogleId: Boolean(process.env.AUTH_GOOGLE_ID),
      hasGoogleSecret: Boolean(process.env.AUTH_GOOGLE_SECRET),
      hasTwitterId: Boolean(process.env.AUTH_TWITTER_ID),
      hasTwitterSecret: Boolean(process.env.AUTH_TWITTER_SECRET)
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
