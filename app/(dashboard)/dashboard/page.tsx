import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const [memberships, recentPosts] = await Promise.all([
    db.membership.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: "asc" }
    }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: { blog: true }
    })
  ]);

  return (
    <div className="main-grid">
      <section className="card">
        <h1 style={{ marginTop: 0 }}>Your posts</h1>
        <a href="/dashboard/editor" className="button primary">
          New article
        </a>
        <ul className="list-clean" style={{ marginTop: "1rem" }}>
          {recentPosts.map((post) => (
            <li key={post.id}>
              <a href={`/dashboard/articles/${post.id}`}>
                <strong>{post.title}</strong>
              </a>
              <p style={{ margin: "0.2rem 0", color: "var(--muted)" }}>
                {post.blog.title} · {post.status}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <aside className="card">
        <h2 style={{ marginTop: 0 }}>Teams</h2>
        <ul className="list-clean">
          {memberships.map((member) => (
            <li key={member.id}>
              <strong>{member.organization.name}</strong>
              <p style={{ margin: "0.2rem 0", color: "var(--muted)" }}>{member.role}</p>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <a className="button" href="/dashboard/team">
            Team settings
          </a>
          <a className="button" href="/dashboard/review">
            Review queue
          </a>
          {session?.user?.platformRole === "ADMIN" && (
            <a className="button" href="/dashboard/platform-admin">
              Platform admin
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
