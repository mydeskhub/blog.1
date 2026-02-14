import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import { PenLine } from "lucide-react";

export const revalidate = 120;

export default async function HomePage() {
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
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
          publishedAt: true,
          author: { select: { name: true, image: true } },
          blog: { select: { slug: true, title: true } },
        },
      });
    } catch {
      posts = [];
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Card className="mb-8 text-center py-10">
        <PenLine className="mx-auto h-10 w-10 text-accent mb-4" />
        <h1 className="text-3xl font-bold text-text">
          Blogging for creators and teams
        </h1>
        <p className="mt-3 text-muted max-w-lg mx-auto">
          Medium-style editor, team workflows, AI-assisted writing, and
          SEO-friendly pages.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/signin">
            <Button variant="primary" size="lg">
              Get started
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg">Dashboard</Button>
          </Link>
        </div>
      </Card>

      <section>
        <h2 className="text-xl font-bold mb-4">Latest posts</h2>
        {posts.length === 0 ? (
          <p className="text-muted text-sm">No published posts yet.</p>
        ) : (
          <Card>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                publishedAt={post.publishedAt}
                authorName={post.author.name}
                authorImage={post.author.image}
                blogTitle={post.blog.title}
              />
            ))}
          </Card>
        )}
      </section>
    </main>
  );
}
