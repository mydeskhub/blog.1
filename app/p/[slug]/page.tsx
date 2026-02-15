import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { PostContent } from "@/components/posts/post-content";
import { CommentSection } from "@/components/posts/comment-section";
import { FloatingBar } from "@/components/posts/floating-bar";
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
      _count: { select: { comments: true } },
    },
  });

  if (!post) notFound();

  const totalClaps = await db.clap.aggregate({
    where: { postId: post.id },
    _sum: { count: true },
  });

  const readTime = post.readTime ?? Math.max(1, Math.round((post.htmlContent?.split(/\s+/).length ?? 0) / 200));

  return (
    <main className="min-h-screen bg-white pb-24">
      <article>
        {/* Title section */}
        <div className="mx-auto max-w-[700px] px-6 pt-12">
          <h1 className="font-serif text-[42px] font-bold leading-[1.15] text-text">
            {post.title}
          </h1>

          {/* Author bar */}
          <div className="mt-8 flex items-center gap-3">
            <Avatar
              src={post.author.image}
              name={post.author.name}
              size={44}
            />
            <div>
              <p className="font-medium text-text">
                {post.author.name ?? "Unknown"}
              </p>
              <p className="text-sm text-muted">
                {readTime} min read &middot; {formatDate(post.publishedAt)}
              </p>
            </div>
          </div>

          {/* Action bar */}
          <div className="mt-6 flex items-center gap-4 border-y border-line py-3 text-sm text-muted">
            <span>{totalClaps._sum.count ?? 0} claps</span>
            <span>&middot;</span>
            <span>{post._count.comments} responses</span>
          </div>
        </div>

        {/* Cover image (wider than text) */}
        {post.coverImageUrl && (
          <div className="mx-auto max-w-[900px] px-6 mt-8">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full rounded-sm object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-[700px] px-6 mt-8">
          <PostContent htmlContent={post.htmlContent} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mx-auto max-w-[700px] px-6 mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t.tagId}
                className="rounded-full bg-gray-100 px-4 py-2 text-sm text-text"
              >
                {t.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Author bio */}
        <div className="mx-auto max-w-[700px] px-6 mt-12 pt-8 border-t border-line">
          <div className="flex items-start gap-4">
            <Avatar
              src={post.author.image}
              name={post.author.name}
              size={56}
            />
            <div>
              <p className="font-bold text-text text-lg">
                {post.author.name ?? "Unknown"}
              </p>
              {post.author.bio && (
                <p className="mt-1 text-sm text-muted leading-relaxed">
                  {post.author.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mx-auto max-w-[700px] px-6 mt-12 pt-8 border-t border-line">
          <CommentSection postId={post.id} />
        </div>
      </article>

      {/* Floating bottom bar */}
      <FloatingBar
        postId={post.id}
        initialClaps={totalClaps._sum.count ?? 0}
        commentCount={post._count.comments}
      />
    </main>
  );
}
