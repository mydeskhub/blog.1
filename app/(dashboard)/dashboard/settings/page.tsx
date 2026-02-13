import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AnalyticsSettingsForm } from "@/components/ui/analytics-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const memberships = await db.membership.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          blogs: {
            select: {
              id: true,
              title: true,
              googleAnalyticsId: true,
              customAnalyticsScript: true
            }
          }
        }
      }
    }
  });

  const blogs = memberships.flatMap((member) => member.organization.blogs);

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Brand and Analytics settings</h1>
      <p style={{ color: "var(--muted)" }}>
        Configure blog branding and inject Google Analytics or custom analytics script per blog.
      </p>

      <form style={{ display: "grid", gap: "0.7rem", maxWidth: 680, marginBottom: "1rem" }}>
        <label>
          Accent color
          <input className="input" type="text" defaultValue="#1a8917" />
        </label>
        <label>
          Typography preset
          <select className="select" defaultValue="classic-serif">
            <option value="classic-serif">Classic Serif</option>
            <option value="modern-sans">Modern Sans</option>
            <option value="editorial-mix">Editorial Mix</option>
          </select>
        </label>
        <label>
          Homepage hero text
          <textarea className="textarea" defaultValue="Ideas worth sharing, from our team to yours." />
        </label>
      </form>

      <AnalyticsSettingsForm blogs={blogs} />
    </section>
  );
}
