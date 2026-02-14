import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    checks: {
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasAuthSecret: Boolean(process.env.AUTH_SECRET),
      hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      hasNextAuthUrl: Boolean(process.env.NEXTAUTH_URL),
      hasGoogleId: Boolean(process.env.AUTH_GOOGLE_ID),
      hasGoogleSecret: Boolean(process.env.AUTH_GOOGLE_SECRET),
      hasTwitterId: Boolean(process.env.AUTH_TWITTER_ID),
      hasTwitterSecret: Boolean(process.env.AUTH_TWITTER_SECRET)
    },
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? null,
      vercelEnv: process.env.VERCEL_ENV ?? null,
      vercelRegion: process.env.VERCEL_REGION ?? null
    }
  });
}
