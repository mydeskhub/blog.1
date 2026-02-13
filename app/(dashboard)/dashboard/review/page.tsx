import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ReviewPage() {
  const session = await auth();
  const userId = session?.user?.id ?? "";

  const queue = await db.reviewRequest.findMany({
    where: {
      OR: [{ reviewerId: userId }, { reviewerId: null }],
      status: { in: ["IN_REVIEW", "CHANGES_REQUESTED"] }
    },
    include: { post: true, requester: true, reviewer: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Draft review queue</h1>
      <ul className="list-clean">
        {queue.map((item) => (
          <li key={item.id}>
            <strong>{item.post.title}</strong>
            <p style={{ margin: "0.2rem 0", color: "var(--muted)" }}>
              Requested by {item.requester.name ?? item.requester.email} · Status: {item.status}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
