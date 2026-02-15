import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TiptapEditor } from "@/components/editor/tiptap-editor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const post = await db.post.findUnique({
    where: { id },
    include: {
      blog: { select: { id: true, title: true, organizationId: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const memberships = await db.membership.findMany({
    where: { userId },
    include: {
      organization: {
        include: { blogs: true },
      },
    },
  });

  const blogs = memberships.flatMap((m) =>
    m.organization.blogs.map((b) => ({
      id: b.id,
      name: `${m.organization.name} / ${b.title}`,
    })),
  );

  return (
    <TiptapEditor
      blogs={blogs}
      post={{
        id: post.id,
        title: post.title,
        content: post.content,
        htmlContent: post.htmlContent ?? undefined,
        blogId: post.blogId,
        status: post.status,
        excerpt: post.excerpt ?? undefined,
        coverImageUrl: post.coverImageUrl ?? undefined,
        tags: post.tags.map((pt) => pt.tag.name),
        seoTitle: post.seoTitle ?? undefined,
        seoDescription: post.seoDescription ?? undefined,
      }}
    />
  );
}
