# Cloudflare CDN Setup

## Goal
Use Cloudflare as reverse proxy/CDN in front of your Next.js app for caching, TLS, and bot protection.

## Steps
1. Add your domain to Cloudflare and enable proxy (orange cloud) for app records.
2. Create DNS record:
   - `CNAME blog -> your-next-app-host`
3. Enable SSL/TLS mode `Full (strict)`.
4. Set cache rules:
   - Cache eligible: `/` and `/p/*`
   - Bypass cache: `/api/*`, `/dashboard/*`, `/signin*`
5. Enable WAF managed rules and rate limiting for login/API routes.
6. Optional: set `NEXT_PUBLIC_CDN_URL` to Cloudflare CDN domain for static asset prefix.

## Existing app config
- `next.config.ts` already sets cache headers for `/` and `/p/*`.
- SSR routes include `revalidate = 120` to support edge cache refresh.
