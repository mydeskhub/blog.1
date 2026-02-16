import { NextResponse } from "next/server";

export function GET() {
  const key = process.env.INDEXNOW_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Not configured" }, { status: 404 });
  }
  return new NextResponse(key, {
    headers: { "Content-Type": "text/plain" },
  });
}
