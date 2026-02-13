import { notFound } from "next/navigation";
import Script from "next/script";
import { db } from "@/lib/db";

export const revalidate = 120;

export default async function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: true,
      blog: true,
      tags: { include: { tag: true } },
      comments: { where: { parentId: null, deletedAt: null }, include: { author: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!post) notFound();

  return (
    <main className="container" style={{ paddingTop: "1rem", paddingBottom: "2rem", maxWidth: 820 }}>
      <article className="card">
        <h1 style={{ marginTop: 0 }}>{post.title}</h1>
        <p style={{ color: "var(--muted)" }}>
          {post.author.name ?? "Unknown"} · {post.publishedAt?.toDateString()}
        </p>
        <div dangerouslySetInnerHTML={{ __html: post.htmlContent ?? "" }} />
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {post.tags.map((t) => (
            <span key={t.tagId} className="button" style={{ padding: "0.3rem 0.6rem" }}>
              #{t.tag.name}
            </span>
          ))}
        </div>
      </article>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Comments</h2>
        <ul className="list-clean">
          {post.comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.author.name ?? "Reader"}</strong>
              <p>{comment.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {post.blog.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${post.blog.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-config" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${post.blog.googleAnalyticsId}');`}
          </Script>
        </>
      )}

      {post.blog.customAnalyticsScript && (
        <Script id="custom-analytics" strategy="afterInteractive">
          {post.blog.customAnalyticsScript}
        </Script>
      )}
    </main>
  );
}
