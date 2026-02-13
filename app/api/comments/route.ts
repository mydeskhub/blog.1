import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const commentSchema = z.object({
  postId: z.string().cuid(),
  body: z.string().min(1).max(2000),
  parentId: z.string().cuid().optional()
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = commentSchema.parse(await request.json());

  const comment = await db.comment.create({
    data: {
      postId: body.postId,
      authorId: user.id,
      body: body.body,
      parentId: body.parentId
    }
  });

  await db.notification.create({
    data: {
      userId: user.id,
      type: "COMMENT",
      title: "Comment posted",
      body: body.body.slice(0, 120)
    }
  });

  return NextResponse.json(comment, { status: 201 });
}
