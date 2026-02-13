import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MediumEditor } from "@/components/editor/medium-editor";

export default async function EditorPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const memberships = await db.membership.findMany({
    where: { userId },
    include: {
      organization: {
        include: { blogs: true }
      }
    }
  });

  const blogs = memberships.flatMap((m) =>
    m.organization.blogs.map((b) => ({ id: b.id, name: `${m.organization.name} / ${b.title}` }))
  );

  return <MediumEditor blogs={blogs} />;
}
