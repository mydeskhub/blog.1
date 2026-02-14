import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TiptapEditor } from "@/components/editor/tiptap-editor";

export default async function NewPostPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

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

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">No blogs found</p>
        <p className="text-sm text-muted">
          Create a team first from the dashboard to start writing.
        </p>
      </div>
    );
  }

  return <TiptapEditor blogs={blogs} />;
}
