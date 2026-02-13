import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const subscribeSchema = z.object({ targetUserId: z.string().cuid() });

export async function POST(request: Request) {
  const user = await requireUser();
  const body = subscribeSchema.parse(await request.json());

  if (body.targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot subscribe to yourself" }, { status: 400 });
  }

  const follow = await db.follow.upsert({
    where: { followerId_followingId: { followerId: user.id, followingId: body.targetUserId } },
    create: { followerId: user.id, followingId: body.targetUserId },
    update: {}
  });

  return NextResponse.json(follow);
}

export async function DELETE(request: Request) {
  const user = await requireUser();
  const body = subscribeSchema.parse(await request.json());

  await db.follow.delete({ where: { followerId_followingId: { followerId: user.id, followingId: body.targetUserId } } });
  return NextResponse.json({ ok: true });
}
