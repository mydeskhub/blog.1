import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { toSlug } from "@/lib/utils";

const createTeamSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional()
});

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
          description: body.description
        }
      }
    },
    include: { memberships: true, blogs: true }
  });

  return NextResponse.json(team, { status: 201 });
}

export async function GET() {
  const user = await requireUser();

  const organizations = await db.membership.findMany({
    where: { userId: user.id },
    include: { organization: { include: { memberships: true, blogs: true } } }
  });

  return NextResponse.json(organizations.map((m) => m.organization));
}
