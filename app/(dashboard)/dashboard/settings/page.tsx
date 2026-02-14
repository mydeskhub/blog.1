import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const memberships = await db.membership.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          blogs: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <h2 className="text-lg font-bold mb-4">Profile</h2>
        <div className="space-y-3 max-w-md">
          <div>
            <p className="text-sm font-medium text-text">Name</p>
            <p className="text-sm text-muted">{session?.user?.name ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-text">Email</p>
            <p className="text-sm text-muted">{session?.user?.email ?? "Not set"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">Your organizations</h2>
        {memberships.length === 0 ? (
          <p className="text-sm text-muted">No organizations yet.</p>
        ) : (
          <div className="space-y-2">
            {memberships.map((m) => (
              <div
                key={m.id}
                className="rounded-lg border border-line px-4 py-3"
              >
                <p className="font-medium">{m.organization.name}</p>
                <p className="text-xs text-muted">
                  {m.role} &middot;{" "}
                  {m.organization.blogs.map((b) => b.title).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
