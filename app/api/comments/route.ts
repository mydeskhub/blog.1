import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { commentSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = commentSchema.parse(await request.json());

  const post = await db.post.findUnique({
    where: { id: body.postId },
    select: { authorId: true, title: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await db.comment.create({
    data: {
      postId: body.postId,
      authorId: user.id,
      body: body.body,
      parentId: body.parentId,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });

  // Notify the post author (not the commenter)
  if (post.authorId !== user.id) {
    await db.notification.create({
      data: {
        userId: post.authorId,
        type: "COMMENT",
        title: `New comment on "${post.title}"`,
        body: body.body.slice(0, 120),
        metadata: { postId: body.postId, commentId: comment.id },
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const comments = await db.comment.findMany({
    where: { postId, parentId: null, deletedAt: null },
    include: {
      author: { select: { id: true, name: true, image: true } },
      replies: {
        where: { deletedAt: null },
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}
