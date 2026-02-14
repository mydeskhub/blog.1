import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { clapSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();
  const body = clapSchema.parse(await request.json());

  const clap = await db.clap.upsert({
    where: { postId_userId: { postId: body.postId, userId: user.id } },
    update: { count: { increment: body.count } },
    create: { postId: body.postId, userId: user.id, count: body.count },
  });

  // Get total clap count for this post
  const total = await db.clap.aggregate({
    where: { postId: body.postId },
    _sum: { count: true },
  });

  return NextResponse.json({ ...clap, totalClaps: total._sum.count ?? 0 });
}
