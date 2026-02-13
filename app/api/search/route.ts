import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) return NextResponse.json({ posts: [], tags: [] });

  const [posts, tags] = await Promise.all([
    db.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: { contains: query, mode: "insensitive" } }, { excerpt: { contains: query, mode: "insensitive" } }]
      },
      take: 20,
      include: { blog: true, author: true }
    }),
    db.tag.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 12 })
  ]);

  return NextResponse.json({ posts, tags });
}
