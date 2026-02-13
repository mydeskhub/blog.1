import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const updateAnalyticsSchema = z.object({
  blogId: z.string().cuid(),
  googleAnalyticsId: z.string().max(60).optional().or(z.literal("")),
  customAnalyticsScript: z.string().max(10000).optional().or(z.literal(""))
});

export async function PATCH(request: Request) {
  const user = await requireUser();
  const body = updateAnalyticsSchema.parse(await request.json());

  const membership = await db.membership.findFirst({
    where: {
      userId: user.id,
      role: { in: ["OWNER", "ADMIN", "EDITOR"] },
      organization: { blogs: { some: { id: body.blogId } } }
    }
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const blog = await db.blog.update({
    where: { id: body.blogId },
    data: {
      googleAnalyticsId: body.googleAnalyticsId || null,
      customAnalyticsScript: body.customAnalyticsScript || null
    },
    select: { id: true, googleAnalyticsId: true, customAnalyticsScript: true }
  });

  return NextResponse.json(blog);
}
