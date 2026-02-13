# Deployment Strategy

## Environments
- `local`: developer machine with Neon Postgres connection.
- `staging`: preview deployment + Neon Postgres + Upstash Redis.
- `production`: Next.js app + Neon Postgres + Upstash Redis + Stripe live.

## Recommended infrastructure
- App: Vercel (Edge-aware Next.js deployment).
- DB: Neon Postgres.
- File storage: Vercel Blob or S3 + CDN.
- Queue/background and cache: Upstash Redis (rate limits, feed/search cache).
- Observability: PostHog, Vercel Analytics, and logs.
- CDN/WAF: Cloudflare proxy + caching + security rules.

## Release flow
1. PR opens preview deployment.
2. CI runs lint + unit + integration smoke + Prisma checks.
3. Migrations run in staging then production.
4. Promote build and monitor error budget.

## Custom domain flow
1. User adds domain in dashboard.
2. Platform stores verification token and required DNS record.
3. Background verifier checks DNS and issues SSL cert through hosting provider.
4. Mark domain `verifiedAt` when active.

## Billing flow ($49 Pro)
1. User/org initiates checkout.
2. Stripe Checkout session created with plan metadata.
3. Webhook updates `OrganizationSubscription` or `UserSubscription` status.
4. Access control reads active subscription state.
