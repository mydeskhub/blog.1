import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const revalidate = 120;

export default async function HomePage() {
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    publishedAt: Date | null;
    author: { name: string | null; image: string | null };
    blog: { slug: string; title: string };
  }> = [];

  if (process.env.DATABASE_URL) {
    try {
      posts = await db.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          author: { select: { name: true, image: true } },
          blog: { select: { slug: true, title: true } },
        },
      });
    } catch {
      posts = [];
    }
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="pb-16 pt-20 md:pt-28">
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-text md:text-6xl lg:text-7xl">
            Your stories,{" "}
            <span className="text-accent">amplified.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            A writing platform built for clarity. Rich editor, team workflows,
            and AI assistance — publish content that gets discovered.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signin">
              <Button variant="primary" size="lg">
                Start writing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg">Dashboard</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-line" />

      {/* Featured post */}
      {featured && (
        <section className="py-12">
          <span className="mb-6 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
            Featured
          </span>
          <Link href={`/p/${featured.slug}`} className="group block">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              {featured.coverImageUrl ? (
                <div className="aspect-[16/10] overflow-hidden rounded-xl">
                  <img
                    src={featured.coverImageUrl}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-accent/10 via-accent/5 to-transparent" />
              )}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {featured.blog.title}
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-text transition-colors group-hover:text-accent md:text-4xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 text-base leading-relaxed text-muted line-clamp-3">
                    {featured.excerpt}
                  </p>
                )}
                <div className="mt-5 flex items-center gap-2.5 text-sm text-muted">
                  <Avatar
                    src={featured.author.image}
                    name={featured.author.name}
                    size={28}
                  />
                  <span className="font-medium text-text/70">
                    {featured.author.name ?? "Unknown"}
                  </span>
                  {featured.publishedAt && (
                    <>
                      <span className="text-line">&middot;</span>
                      <span>{formatDate(featured.publishedAt)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Post grid */}
      {rest.length > 0 && (
        <section className="border-t border-line py-12">
          <h2 className="mb-8 font-display text-2xl font-bold tracking-tight">
            Latest
          </h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <PostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                coverImageUrl={post.coverImageUrl}
                publishedAt={post.publishedAt}
                authorName={post.author.name}
                authorImage={post.author.image}
                blogTitle={post.blog.title}
              />
            ))}
          </div>
        </section>
      )}

      {posts.length === 0 && (
        <section className="py-16 text-center">
          <p className="text-muted">No published posts yet.</p>
        </section>
      )}
    </main>
  );
}
