# Vercel Free + Neon Deployment Guide

## 1) Create Neon database
1. Sign in to Neon and create a new project/database.
2. Copy the pooled connection string.
3. Ensure `sslmode=require` is in the URL.

## 2) Configure local environment
1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your Neon URL.
3. Fill OAuth/API keys as needed.

## 3) Install and initialize
1. `npm install`
2. `npx prisma generate`
3. `npx prisma migrate dev --name init`
4. `npm run prisma:seed`
5. `npm run build`

## 4) Push to GitHub
1. `git add .`
2. `git commit -m "Configure Neon + Vercel deployment"`
3. `git push`

## 5) Create Vercel project
1. In Vercel, click "Add New Project" and import repository.
2. Keep framework preset as Next.js.
3. Do not override build command unless needed (`next build` default works).

## 6) Add Vercel environment variables
Set these in Vercel Project Settings -> Environment Variables:
- `DATABASE_URL`
- `NEXTAUTH_URL` = `https://<your-project>.vercel.app`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL` = `https://<your-project>.vercel.app`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `AUTH_TWITTER_ID`, `AUTH_TWITTER_SECRET`
- `VERCEL_AI_GATEWAY_API_KEY`
- `POSTHOG_API_KEY`, `POSTHOG_HOST` (optional)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (optional)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (optional)
- `NEXT_PUBLIC_CDN_URL` (optional)

## 7) Run migrations against Neon
Run from local machine (pointing to production Neon URL):
1. `npx prisma migrate deploy`
2. `npm run prisma:seed` (first deployment only)

## 8) Configure OAuth callbacks
- Google callback URL: `https://<your-project>.vercel.app/api/auth/callback/google`
- Twitter callback URL: `https://<your-project>.vercel.app/api/auth/callback/twitter`

## 9) First deploy and smoke test
1. Trigger deploy from Vercel.
2. Verify:
- `/signin`
- `/dashboard`
- `/dashboard/editor`
- `/p/<slug>`

## 10) Promote an admin user
Update your user in database:
- Set `platformRole` to `ADMIN`.
- Admin page: `/dashboard/platform-admin`
