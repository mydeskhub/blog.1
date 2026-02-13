import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: { revisions: true, tags: { include: { tag: true } }, comments: true }
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    status?: "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
    content?: unknown;
    htmlContent?: string;
    summary?: string;
  };

  const existing = await db.post.findUnique({ where: { id }, include: { blog: true } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organizationId: existing.blog.organizationId }
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const post = await db.post.update({
    where: { id },
    data: {
      ...(body.title ? { title: body.title } : {}),
      ...(body.content ? { content: body.content } : {}),
      ...(body.htmlContent ? { htmlContent: body.htmlContent } : {}),
      ...(body.status ? { status: body.status, publishedAt: body.status === "PUBLISHED" ? new Date() : existing.publishedAt } : {}),
      revisions: body.content
        ? {
            create: {
              editorId: user.id,
              title: body.title ?? existing.title,
              content: body.content,
              htmlContent: body.htmlContent,
              summary: body.summary ?? "Manual edit"
            }
          }
        : undefined
    }
  });

  return NextResponse.json(post);
}
