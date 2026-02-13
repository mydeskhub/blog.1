# BlogSaaS Platform

Full-stack blogging SaaS built with Next.js 15, Prisma, Neon Postgres, NextAuth, TipTap, and Vercel AI Gateway.

## Implemented scope
- Medium-style editor UX with drag/drop image support hook and AI side pane.
- Rich article workflow: drafts, review flow, approvals, publish states, revisions.
- Multi-tenant organizations (solo or team), role-based access, and team membership.
- Custom domain registration + verification workflow endpoint.
- OAuth authentication (Google + Twitter).
- Core social features: tags, comments, claps, follows/subscriptions, personalized feed, search.
- Analytics endpoint and PostHog AI event tracking.
- SaaS billing scaffolding for fixed $49/month Pro plan.
- SSR public post pages with SEO-friendly slug routes.
- Platform-level admin dashboard for global product stats.
- Per-blog analytics script settings (Google Analytics ID or custom script).
- Unit + integration test scaffolding.

## Quick start
1. Copy `.env.example` to `.env` and fill keys.
2. Install dependencies:
   - `npm install`
3. Initialize database:
   - `npx prisma migrate dev --name init`
   - `npm run prisma:seed`
4. Run app:
   - `npm run dev`

## Key directories
- `/app` Next.js pages and API handlers.
- `/components/editor` Medium-style editor and AI pane.
- `/lib` auth, db, AI gateway integration, validation, permissions.
- `/lib/redis.ts` optional Upstash Redis integration for rate limits/cache.
- `/prisma/schema.prisma` complete data model.
- `/docs` API, architecture, deployment, scalability docs.
- `/tests` unit and Playwright integration tests.

## API and architecture docs
- `docs/architecture.md`
- `docs/api-design.md`
- `docs/deployment.md`
- `docs/scalability-plan.md`
- `docs/cloudflare-cdn.md`
- `docs/vercel-neon-deploy.md`

## Production hardening checklist
- Replace image upload stub with Vercel Blob or S3 upload pipeline.
- Add Stripe checkout + webhook routes to finalize subscription lifecycle.
- Add rate limiting and abuse protection for AI and comment routes.
- Add moderation policy engine and async workers if needed.
- Add OpenTelemetry tracing and alerting for SLO monitoring.
