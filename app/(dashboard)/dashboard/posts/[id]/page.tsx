import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PostStatusBadge } from "@/components/dashboard/post-status-badge";
import { formatDate } from "@/lib/utils";
import { Edit, ExternalLink, Clock } from "lucide-react";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, image: true } },
      blog: { select: { title: true } },
      revisions: { orderBy: { createdAt: "desc" }, take: 10 },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, claps: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {post.blog.title} &middot; {formatDate(post.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PostStatusBadge status={post.status} />
          <Link href={`/dashboard/posts/${post.id}/edit`}>
            <Button size="sm">
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          {post.status === "PUBLISHED" && (
            <Link href={`/p/${post.slug}`} target="_blank">
              <Button size="sm" variant="ghost">
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
            </Link>
          )}
        </div>
      </div>

      {post.excerpt && (
        <Card>
          <p className="text-sm text-muted">{post.excerpt}</p>
        </Card>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((pt) => (
            <Badge key={pt.tagId}>#{pt.tag.name}</Badge>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-2xl font-bold">{post._count.comments}</p>
          <p className="text-xs text-muted">Comments</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">{post._count.claps}</p>
          <p className="text-xs text-muted">Claps</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">{post.viewCount}</p>
          <p className="text-xs text-muted">Views</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted" />
          <h2 className="font-bold">Revision history</h2>
        </div>
        <div className="space-y-2">
          {post.revisions.map((rev) => (
            <div
              key={rev.id}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-2 text-sm"
            >
              <span className="text-muted">{formatDate(rev.createdAt)}</span>
              <span>{rev.summary ?? "Autosave"}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
