import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { updatePostSchema } from "@/lib/validation";
import { toSlug } from "@/lib/utils";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      blog: { select: { id: true, title: true, slug: true, organizationId: true } },
      revisions: { orderBy: { createdAt: "desc" }, take: 20 },
      tags: { include: { tag: true } },
      comments: {
        where: { parentId: null, deletedAt: null },
        include: { author: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { claps: true, comments: true } },
    },
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;
  const body = updatePostSchema.parse(await request.json());

  const existing = await db.post.findUnique({
    where: { id },
    include: { blog: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organizationId: existing.blog.organizationId },
  });
  if (!membership)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Handle tag updates
  let tagOperations = {};
  if (body.tags) {
    tagOperations = {
      tags: {
        deleteMany: {},
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
    };
  }

  const post = await db.post.update({
    where: { id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.content ? { content: body.content } : {}),
      ...(body.htmlContent ? { htmlContent: body.htmlContent } : {}),
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(body.coverImageUrl !== undefined
        ? { coverImageUrl: body.coverImageUrl }
        : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
      ...(body.status
        ? {
            status: body.status,
            publishedAt:
              body.status === "PUBLISHED"
                ? existing.publishedAt ?? new Date()
                : existing.publishedAt,
          }
        : {}),
      ...tagOperations,
      ...(body.content
        ? {
            revisions: {
              create: {
                editorId: user.id,
                title: body.title ?? existing.title,
                content: body.content,
                htmlContent: body.htmlContent,
                summary: body.summary ?? "Manual edit",
              },
            },
          }
        : {}),
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const { id } = await params;

  const existing = await db.post.findUnique({
    where: { id },
    include: { blog: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organizationId: existing.blog.organizationId },
  });
  if (!membership)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
