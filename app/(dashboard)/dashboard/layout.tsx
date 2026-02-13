import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  return <main className="container" style={{ paddingTop: "1rem", paddingBottom: "2rem" }}>{children}</main>;
}
