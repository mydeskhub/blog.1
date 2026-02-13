import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tags = await db.tag.findMany({
    take: 100,
    orderBy: { name: "asc" },
    include: { posts: { select: { postId: true } } }
  });

  return NextResponse.json(
    tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      postCount: tag.posts.length
    }))
  );
}
