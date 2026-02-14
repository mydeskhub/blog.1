import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      <aside className="hidden md:block">
        <div className="sticky top-20">
          <SidebarNav />
        </div>
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
