import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { toSlug } from "@/lib/utils";
import { createTeamSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = createTeamSchema.parse(await request.json());

  const slug = `${toSlug(body.name)}-${Date.now().toString().slice(-4)}`;
  const team = await db.organization.create({
    data: {
      name: body.name,
      slug,
      description: body.description,
      memberships: { create: { userId: user.id, role: "OWNER" } },
      blogs: {
        create: {
          title: body.name,
          slug: "main",
          description: body.description,
        },
      },
    },
    include: { memberships: true, blogs: true },
  });

  return NextResponse.json(team, { status: 201 });
}

export async function GET() {
  const user = await requireUser();

  const memberships = await db.membership.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: { blogs: true },
      },
    },
  });

  return NextResponse.json(memberships.map((m) => m.organization));
}
