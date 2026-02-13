import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

const clapSchema = z.object({ postId: z.string().cuid(), count: z.number().int().min(1).max(50).default(1) });

export async function POST(request: Request) {
  const user = await requireUser();
  const body = clapSchema.parse(await request.json());

  const clap = await db.clap.upsert({
    where: { postId_userId: { postId: body.postId, userId: user.id } },
    update: { count: { increment: body.count } },
    create: { postId: body.postId, userId: user.id, count: body.count }
  });

  return NextResponse.json(clap);
}
