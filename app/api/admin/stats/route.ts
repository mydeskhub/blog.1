import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  const me = await db.user.findUnique({ where: { id: user.id }, select: { platformRole: true } });

  if (!me || me.platformRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, organizations, posts, publishedPosts, comments, activeOrgSubs, activeUserSubs] = await Promise.all([
    db.user.count(),
    db.organization.count(),
    db.post.count(),
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.comment.count({ where: { deletedAt: null } }),
    db.organizationSubscription.count({ where: { status: "ACTIVE" } }),
    db.userSubscription.count({ where: { status: "ACTIVE" } })
  ]);

  return NextResponse.json({
    users,
    organizations,
    posts,
    publishedPosts,
    comments,
    activeSubscriptions: activeOrgSubs + activeUserSubs
  });
}
