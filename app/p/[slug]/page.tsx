import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PostContent } from "@/components/posts/post-content";
import { CommentSection } from "@/components/posts/comment-section";
import { ClapButton } from "@/components/posts/clap-button";
import { formatDate } from "@/lib/utils";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      coverImageUrl: true,
      author: { select: { name: true } },
    },
  });

  if (!post) return { title: "Post not found" };

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      type: "article",
      ...(post.coverImageUrl && { images: [post.coverImageUrl] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
    },
  };
}

export default async function PublicPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, image: true, bio: true } },
      blog: { select: { title: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const totalClaps = await db.clap.aggregate({
    where: { postId: post.id },
    _sum: { count: true },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <article>
        <Card>
          <h1 className="text-3xl font-bold leading-tight text-text">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <Avatar
              src={post.author.image}
              name={post.author.name}
              size={40}
            />
            <div>
              <p className="font-medium text-text">
                {post.author.name ?? "Unknown"}
              </p>
              <p className="text-xs text-muted">
                {post.blog.title} &middot; {formatDate(post.publishedAt)}
                {post.readTime && ` · ${post.readTime} min read`}
              </p>
            </div>
          </div>

          {post.coverImageUrl && (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="mt-6 w-full rounded-xl object-cover"
            />
          )}

          <div className="mt-6">
            <PostContent htmlContent={post.htmlContent} />
          </div>

          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t.tagId}>#{t.tag.name}</Badge>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-line">
            <ClapButton
              postId={post.id}
              initialCount={totalClaps._sum.count ?? 0}
            />
          </div>
        </Card>
      </article>

      <Card className="mt-6">
        <CommentSection postId={post.id} />
      </Card>
    </main>
  );
}
