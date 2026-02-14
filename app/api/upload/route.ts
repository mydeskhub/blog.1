import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/session";

export async function POST(request: Request) {
  await requireUser();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url, filename: file.name });
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Ensure BLOB_READ_WRITE_TOKEN is configured." },
      { status: 500 },
    );
  }
}
