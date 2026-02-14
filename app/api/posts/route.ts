import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { canPublishStatusTransition } from "@/lib/permissions";
import { requireUser } from "@/lib/session";
import { toSlug, excerptFromHtml } from "@/lib/utils";
import { createPostSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = createPostSchema.parse(await request.json());

    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organization: { blogs: { some: { id: body.blogId } } },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!canPublishStatusTransition(membership.role, body.status)) {
      return NextResponse.json(
        { error: "Insufficient role for requested status" },
        { status: 403 },
      );
    }

    const slugBase = toSlug(body.title);
    const uniqueSlug = `${slugBase}-${Date.now().toString().slice(-6)}`;

    const post = await db.post.create({
      data: {
        blogId: body.blogId,
        authorId: user.id,
        title: body.title,
        slug: uniqueSlug,
        excerpt: body.excerpt ?? excerptFromHtml(body.htmlContent ?? ""),
        coverImageUrl: body.coverImageUrl,
        content: body.content,
        htmlContent: body.htmlContent,
        status: body.status,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
        tags: {
          create: await Promise.all(
            body.tags.map(async (tagName) => {
              const slug = toSlug(tagName);
              const tag = await db.tag.upsert({
                where: { slug },
                update: { name: tagName },
                create: { name: tagName, slug },
              });
              return { tagId: tag.id };
            }),
          ),
        },
        revisions: {
          create: {
            editorId: user.id,
            title: body.title,
            content: body.content,
            htmlContent: body.htmlContent,
            summary: "Initial save",
          },
        },
      },
    });

    if (body.status === "IN_REVIEW") {
      await db.reviewRequest.create({
        data: {
          postId: post.id,
          requesterId: user.id,
          status: "IN_REVIEW",
        },
      });
    }

    return NextResponse.json({ id: post.id, slug: post.slug });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get("blogId");

  const posts = await db.post.findMany({
    where: {
      ...(blogId ? { blogId } : {}),
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
      blog: { select: { title: true, slug: true } },
    },
  });

  return NextResponse.json(posts);
}
