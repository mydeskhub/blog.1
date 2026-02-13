import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const createDomainSchema = z.object({
  blogId: z.string().cuid(),
  hostname: z.string().min(4).regex(/^[a-z0-9.-]+$/)
});

export async function POST(request: Request) {
  const user = await requireUser();
  const body = createDomainSchema.parse(await request.json());

  const allowed = await db.membership.findFirst({
    where: {
      userId: user.id,
      role: { in: ["OWNER", "ADMIN"] },
      organization: { blogs: { some: { id: body.blogId } } }
    }
  });

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const domain = await db.customDomain.create({
    data: {
      blogId: body.blogId,
      hostname: body.hostname,
      verificationToken: crypto.randomUUID()
    }
  });

  return NextResponse.json({
    ...domain,
    dnsInstructions: {
      type: "CNAME",
      name: body.hostname,
      value: "cname.vercel-dns.com"
    }
  });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = z.object({ domainId: z.string().cuid(), verified: z.boolean() }).parse(await request.json());

  const domain = await db.customDomain.findUnique({ where: { id: body.domainId }, include: { blog: true } });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  const allowed = await db.membership.findFirst({
    where: {
      userId: user.id,
      role: { in: ["OWNER", "ADMIN"] },
      organizationId: domain.blog.organizationId
    }
  });

  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await db.customDomain.update({
    where: { id: domain.id },
    data: { verifiedAt: body.verified ? new Date() : null }
  });

  return NextResponse.json(updated);
}
