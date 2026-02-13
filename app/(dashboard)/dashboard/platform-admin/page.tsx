import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PlatformAdminPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/signin");

  const me = await db.user.findUnique({ where: { id: userId }, select: { platformRole: true } });
  if (!me || me.platformRole !== "ADMIN") redirect("/dashboard");

  const [users, organizations, posts, publishedPosts, comments, activeOrgSubs, activeUserSubs] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.post.count(),
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.comment.count({ where: { deletedAt: null } }),
    db.organizationSubscription.count({ where: { status: "ACTIVE" } }),
    db.userSubscription.count({ where: { status: "ACTIVE" } })
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Organizations", value: organizations },
    { label: "Total posts", value: posts },
    { label: "Published posts", value: publishedPosts },
    { label: "Comments", value: comments },
    { label: "Active subscriptions", value: activeOrgSubs + activeUserSubs }
  ];

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Platform Admin Dashboard</h1>
      <p style={{ color: "var(--muted)" }}>Global platform insights for admins only.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
        {stats.map((stat) => (
          <article key={stat.label} className="card" style={{ padding: "0.8rem" }}>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>{stat.label}</p>
            <p style={{ margin: "0.3rem 0 0", fontSize: "1.5rem", fontWeight: 700 }}>{stat.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
