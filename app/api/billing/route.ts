import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Stripe checkout/session creation integration point.
export async function POST(request: Request) {
  const user = await requireUser();
  const body = (await request.json()) as { organizationId?: string };

  if (body.organizationId) {
    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: body.organizationId,
        role: { in: ["OWNER", "ADMIN"] }
      }
    });

    if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({
      message: "Create Stripe Checkout for organization plan",
      plan: "pro",
      amountCents: 4900
    });
  }

  return NextResponse.json({
    message: "Create Stripe Checkout for personal plan",
    plan: "pro",
    amountCents: 4900
  });
}
