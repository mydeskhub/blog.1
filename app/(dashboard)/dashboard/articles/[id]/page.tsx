import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function ArticleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({ where: { id }, include: { revisions: true, tags: { include: { tag: true } } } });

  if (!post) notFound();

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>{post.title}</h1>
      <p style={{ color: "var(--muted)" }}>Status: {post.status}</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.8rem" }}>
        {post.tags.map((pt) => (
          <span key={pt.tagId} className="button" style={{ padding: "0.3rem 0.6rem" }}>
            #{pt.tag.name}
          </span>
        ))}
      </div>
      <h2>Revision history</h2>
      <ul className="list-clean">
        {post.revisions.map((rev) => (
          <li key={rev.id}>
            {rev.createdAt.toLocaleString()} · {rev.summary ?? "Autosave"}
          </li>
        ))}
      </ul>
    </section>
  );
}
