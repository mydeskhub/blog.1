import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TeamPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const teams = await db.membership.findMany({
    where: { userId },
    include: {
      organization: {
        include: { memberships: { include: { user: true } }, blogs: { include: { domains: true } } }
      }
    }
  });

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Team management</h1>
      {teams.map((team) => (
        <div key={team.organization.id} style={{ borderTop: "1px solid var(--line)", paddingTop: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: 0 }}>{team.organization.name}</h2>
          <p style={{ color: "var(--muted)" }}>Your role: {team.role}</p>
          <h3>Members</h3>
          <ul className="list-clean">
            {team.organization.memberships.map((member) => (
              <li key={member.id}>
                {member.user.name ?? member.user.email} · {member.role}
              </li>
            ))}
          </ul>
          <h3>Domains</h3>
          <ul className="list-clean">
            {team.organization.blogs.flatMap((blog) =>
              blog.domains.map((domain) => (
                <li key={domain.id}>
                  {blog.title}: {domain.hostname} {domain.verifiedAt ? "(verified)" : "(pending)"}
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </section>
  );
}
