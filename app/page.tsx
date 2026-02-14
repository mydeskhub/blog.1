import { db } from "@/lib/db";

export const revalidate = 120;

export default async function HomePage() {
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    author: { name: string | null };
    blog: { slug: string; title: string };
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      posts = await db.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          publishedAt: true,
          author: { select: { name: true } },
          blog: { select: { slug: true, title: true } }
        }
      });
    } catch {
      posts = [];
    }
  }

  return (
    <main className="container" style={{ paddingTop: "1rem", paddingBottom: "2rem" }}>
      <section className="card" style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Managed Blogging SaaS for creators and teams</h1>
        <p style={{ color: "var(--muted)", maxWidth: 760 }}>
          Medium-style editor, team workflows, custom domains, AI-assisted writing, subscription billing,
          analytics and SEO-friendly SSR pages.
        </p>
      </section>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Latest posts</h2>
        <ul className="list-clean">
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/p/${post.slug}`}>
                <strong>{post.title}</strong>
              </a>
              <p style={{ margin: "0.3rem 0 0", color: "var(--muted)" }}>
                {post.excerpt ?? "No excerpt"} · {post.author.name ?? "Unknown"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
