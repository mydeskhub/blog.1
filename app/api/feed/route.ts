import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();

  const following = await db.follow.findMany({ where: { followerId: user.id }, select: { followingId: true } });
  const followedIds = following.map((f) => f.followingId);

  const feed = await db.post.findMany({
    where: { status: "PUBLISHED", authorId: { in: followedIds.length ? followedIds : [user.id] } },
    orderBy: { publishedAt: "desc" },
    take: 40,
    include: { author: true, tags: { include: { tag: true } } }
  });

  return NextResponse.json(feed);
}
