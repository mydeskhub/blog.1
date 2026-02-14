import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PostStatusBadge } from "@/components/dashboard/post-status-badge";
import { formatDate } from "@/lib/utils";
import { PenLine, Plus, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const [memberships, recentPosts] = await Promise.all([
    db.membership.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { createdAt: "asc" },
    }),
    db.post.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        blog: { select: { title: true } },
        tags: { include: { tag: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your posts</h1>
        <Link href="/dashboard/new">
          <Button variant="primary">
            <PenLine className="h-4 w-4" />
            New post
          </Button>
        </Link>
      </div>

      {recentPosts.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 py-12 text-center">
          <PenLine className="h-10 w-10 text-muted" />
          <div>
            <p className="font-medium text-text">No posts yet</p>
            <p className="mt-1 text-sm text-muted">
              {memberships.length === 0
                ? "Create a team first, then start writing."
                : "Start writing your first post."}
            </p>
          </div>
          {memberships.length === 0 ? (
            <CreateTeamButton />
          ) : (
            <Link href="/dashboard/new">
              <Button variant="primary">Write your first post</Button>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="p-0 divide-y divide-line">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/dashboard/posts/${post.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <div className="min-w-0">
                <p className="font-medium text-text truncate">{post.title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {post.blog.title} &middot; Updated {formatDate(post.updatedAt)}
                </p>
              </div>
              <PostStatusBadge status={post.status} />
            </Link>
          ))}
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-muted" />
          <h2 className="text-lg font-bold">Teams</h2>
        </div>
        {memberships.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted mb-3">
              Create a team to start writing posts.
            </p>
            <CreateTeamButton />
          </div>
        ) : (
          <div className="space-y-2">
            {memberships.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
              >
                <div>
                  <p className="font-medium text-text">
                    {member.organization.name}
                  </p>
                  <p className="text-xs text-muted">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CreateTeamButton() {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const { requireUser } = await import("@/lib/session");
        const user = await requireUser();
        const name = formData.get("name") as string;
        if (!name || name.length < 2) return;
        const { db } = await import("@/lib/db");
        const { toSlug } = await import("@/lib/utils");
        const slug = `${toSlug(name)}-${Date.now().toString().slice(-4)}`;
        await db.organization.create({
          data: {
            name,
            slug,
            memberships: { create: { userId: user.id, role: "OWNER" } },
            blogs: { create: { title: name, slug: "main" } },
          },
        });
        const { redirect } = await import("next/navigation");
        redirect("/dashboard");
      }}
      className="flex gap-2"
    >
      <input
        name="name"
        placeholder="Team name"
        required
        minLength={2}
        className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
      />
      <Button variant="primary" type="submit">
        <Plus className="h-4 w-4" />
        Create team
      </Button>
    </form>
  );
}
