import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get("blogId");

  if (!blogId) return NextResponse.json({ error: "blogId is required" }, { status: 400 });

  const membership = await db.membership.findFirst({
    where: { userId: user.id, organization: { blogs: { some: { id: blogId } } } }
  });

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [posts, comments, claps] = await Promise.all([
    db.post.aggregate({ where: { blogId, status: "PUBLISHED" }, _sum: { viewCount: true }, _count: true }),
    db.comment.count({ where: { post: { blogId }, deletedAt: null } }),
    db.clap.aggregate({ where: { post: { blogId } }, _sum: { count: true } })
  ]);

  return NextResponse.json({
    publishedPosts: posts._count,
    totalViews: posts._sum.viewCount ?? 0,
    totalComments: comments,
    totalClaps: claps._sum.count ?? 0
  });
}
