import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";

export async function POST(request: Request) {
  await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  // Storage integration point. Replace with Vercel Blob or S3 upload in production.
  const fallbackUrl = `https://images.unsplash.com/photo-1498050108023-c5249f4df085?fit=crop&w=1200&q=80`;
  return NextResponse.json({ url: fallbackUrl, filename: file.name });
}
