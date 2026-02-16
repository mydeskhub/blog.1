import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/avatar";
import { PostContent } from "@/components/posts/post-content";
import { CommentSection } from "@/components/posts/comment-section";
import { FloatingBar } from "@/components/posts/floating-bar";
import { formatDate } from "@/lib/utils";
import {
  JsonLd,
  canonicalUrl,
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  generateFaqJsonLd,
} from "@/lib/seo";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      excerpt: true,
      slug: true,
      seoTitle: true,
      seoDescription: true,
      coverImageUrl: true,
      publishedAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!post) return { title: "Post not found" };

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? undefined;
  const tagNames = post.tags.map((t) => t.tag.name);

  return {
    title,
    description,
    alternates: { canonical: `/p/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.publishedAt && {
        publishedTime: new Date(post.publishedAt).toISOString(),
      }),
      ...(post.updatedAt && {
        modifiedTime: new Date(post.updatedAt).toISOString(),
      }),
      ...(post.author.name && { authors: [post.author.name] }),
      ...(tagNames.length > 0 && { tags: tagNames }),
      ...(post.coverImageUrl && { images: [post.coverImageUrl] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  const articleJsonLd = generateArticleJsonLd(
    {
      title: post.title,
      excerpt: post.excerpt,
      htmlContent: post.htmlContent,
      coverImageUrl: post.coverImageUrl,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      slug: post.slug,
    },
    { name: post.author.name, image: post.author.image },
  );

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: "Home", url: canonicalUrl("/") },
    ...(post.blog?.title
      ? [{ name: post.blog.title }]
      : []),
    { name: post.title },
  ]);

  const faqJsonLd = post.htmlContent
    ? generateFaqJsonLd(post.htmlContent)
    : null;

  return (
    <main className="min-h-screen bg-surface pb-24">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <article>
        {/* Header section */}
        <div className="mx-auto max-w-[720px] px-6 pt-12 md:pt-16">
          {/* Category label */}
          {post.blog?.title && (
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-accent">
              {post.blog.title}
            </span>
          )}

          {/* Title */}
          <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-text md:text-[3.25rem]">
            {post.title}
          </h1>

          {/* Excerpt as subtitle */}
          {post.excerpt && (
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {post.excerpt}
            </p>
          )}

          {/* Author block */}
          <div className="mt-8 flex items-center gap-3.5 border-y border-line py-5">
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
                {formatDate(post.publishedAt)}
                <span className="mx-1.5 text-line">&middot;</span>
                {readTime} min read
              </p>
            </div>
          </div>
        </div>

        {/* Cover image (wider than text) */}
        {post.coverImageUrl && (
          <div className="mx-auto max-w-[920px] px-6 mt-8">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full rounded-xl object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-[720px] px-6 mt-10">
          <PostContent htmlContent={post.htmlContent} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mx-auto max-w-[720px] px-6 mt-12 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t.tagId}
                className="rounded-md border border-line px-3 py-1 text-xs font-medium text-text/70 transition-colors hover:border-text/20"
              >
                {t.tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Author bio */}
        <div className="mx-auto max-w-[720px] px-6 mt-14 pt-8 border-t border-line">
          <div className="flex items-start gap-4">
            <Avatar
              src={post.author.image}
              name={post.author.name}
              size={56}
            />
            <div>
              <p className="font-display font-bold text-text text-lg">
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
        <div className="mx-auto max-w-[720px] px-6 mt-12 pt-8 border-t border-line">
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
