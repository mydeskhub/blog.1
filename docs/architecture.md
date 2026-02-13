# Architecture

## Stack
- Frontend + SSR: Next.js 15 App Router, React 19, TypeScript.
- API: Next.js Route Handlers (REST-first, can evolve to GraphQL gateway).
- Database: Neon Postgres with Prisma ORM.
- Auth: NextAuth (Google + Twitter OAuth) with Prisma adapter.
- Editor: TipTap with Medium-style clean writing surface.
- AI: Vercel AI Gateway (`openai/gpt-4.1-mini`) with PostHog event tracking.
- Cache/rate-limit: Optional Upstash Redis.
- Billing: Stripe integration points with a fixed $49/month Pro plan.

## Tenancy model
- `Organization` is the workspace boundary.
- `Blog` belongs to an organization.
- Users can have one or many memberships with scoped roles.
- Individuals can use a single-member org, companies can use multi-member orgs.

## Roles
- Platform roles: `USER`, `ADMIN`.
- Organization roles: `OWNER`, `ADMIN`, `EDITOR`, `AUTHOR`, `REVIEWER`, `VIEWER`.
- Editorial flow supports draft review and approval states.

## Editorial workflow
1. Author writes draft in TipTap editor.
2. Draft saved as `Post` and `PostRevision`.
3. Author requests review (`IN_REVIEW`) and creates `ReviewRequest`.
4. Reviewer/editor approves or requests changes.
5. Editor/owner/admin publishes.

## SEO and URLs
- SSR pages render published posts at `/p/[slug]`.
- Each post has `slug`, `seoTitle`, `seoDescription`.
- Custom domains can be attached to each blog and verified.

## AI-assisted editing UX
- AI pane sends selected text + mode to `/api/ai/suggest`.
- Modes: rephrase, tone, grammar, outline, expand.
- User can accept (insert suggestion), reject, or regenerate.
- AI acts as assistive tooling; user retains final authorship.
