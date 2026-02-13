# API Design (REST)

## Auth
- `GET/POST /api/auth/[...nextauth]`

## Articles
- `POST /api/articles` create draft/review/published article.
- `GET /api/articles?blogId=` list published posts.
- `GET /api/articles/:id` fetch article detail.
- `PATCH /api/articles/:id` update content/status, create revision.
- `POST /api/articles/upload` image upload endpoint (replace with Blob/S3 implementation).

## AI
- `POST /api/ai/suggest` generate contextual writing assistance.
  - Includes optional Upstash Redis rate-limit enforcement.

## Team / SaaS management
- `POST /api/teams` create organization + default blog.
- `GET /api/teams` list user organizations.
- `POST /api/domains` register custom domain and get DNS instructions.
- `PATCH /api/domains` mark domain verification status.
- `POST /api/billing` create billing checkout flow for user/org.
- `PATCH /api/blogs/analytics` set Google Analytics ID or custom script for a blog.

## Platform admin
- `GET /api/admin/stats` admin-only global metrics (users, orgs, posts, subscriptions).

## Discovery and personalization
- `GET /api/feed` personalized feed from followed authors.
- `GET /api/search?q=` full-text style search starter.
- `GET /api/tags` tag catalog with counts.

## Engagement
- `POST /api/comments` create comment/reply.
- `POST /api/claps` clap support (up to 50 increment).
- `POST /api/subscriptions` follow author.
- `DELETE /api/subscriptions` unfollow author.

## Analytics
- `GET /api/analytics?blogId=` returns publishedPosts, totalViews, totalComments, totalClaps.

## Security
- All mutating endpoints require authenticated session.
- Team-scoped mutations require organization membership and role checks.
- Publishing restricted to owner/admin/editor.
