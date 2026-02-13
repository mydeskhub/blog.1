# Scalability Plan

## Data layer
- Add indexes for hot queries (`blogId+status`, author feed, comments by post/time).
- Use read replicas for analytics and feed queries.
- Partition very large tables (events, notifications) by time.

## API layer
- Use route-level caching where safe (`tags`, public post pages).
- Add Redis for feed/search caching and rate limiting.
- Move expensive tasks (AI batching, domain verification, digest emails) to background workers.

## Search
- Start with PostgreSQL search patterns (`ILIKE`/trigram/full-text) and migrate to Meilisearch/OpenSearch for advanced ranking.
- Maintain denormalized search documents per post revision.

## Real-time
- Add WebSocket/SSE notification service for comments/review events when needed.

## Multi-tenant hardening
- Enforce org scoping at every query path.
- Add row-level security policy if using DB-managed tenancy.
- Add audit logs for role changes, publishing, and billing actions.

## Performance goals
- P95 API latency under 250ms for cached reads.
- Time-to-first-byte for SSR post pages under 350ms.
- Editor save action under 500ms for normal post sizes.
