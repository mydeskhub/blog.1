import { NextResponse } from "next/server";
import { generateSuggestion } from "@/lib/ai";
import { requireUser } from "@/lib/session";
import { aiSuggestionSchema } from "@/lib/validation";
import { captureEvent } from "@/lib/posthog";
import { checkRateLimit } from "@/lib/redis";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const allowed = await checkRateLimit(`ai:${user.id}`, 30, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429 },
      );
    }

    const body = aiSuggestionSchema.parse(await request.json());
    const suggestion = await generateSuggestion(body);

    await captureEvent(user.id, "ai_suggestion_generated", {
      mode: body.mode,
      selectionLength: body.selection.length,
    });

    return NextResponse.json({ suggestion });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
