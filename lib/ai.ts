import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { aiSuggestionSchema } from "@/lib/validation";

type AISuggestionInput = Parameters<typeof aiSuggestionSchema.parse>[0];

const gateway = createOpenAI({
  apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY,
  baseURL: "https://ai-gateway.vercel.sh/v1"
});

function buildPrompt(input: ReturnType<typeof aiSuggestionSchema.parse>) {
  const base = [
    "You are an expert writing assistant inside a professional blogging editor.",
    "Preserve author voice and intent.",
    "Return only improved content, no preface.",
    "If confidence is low, keep edits minimal."
  ].join(" ");

  switch (input.mode) {
    case "rephrase":
      return `${base} Rephrase this text for readability:\n\n${input.selection}`;
    case "tone":
      return `${base} Rewrite with ${input.tone ?? "professional"} tone:\n\n${input.selection}`;
    case "grammar":
      return `${base} Fix grammar and punctuation only:\n\n${input.selection}`;
    case "outline":
      return `${base} Generate a concise article outline based on:\n\n${input.selection}`;
    case "expand":
      return `${base} Expand this section to around ${input.targetLength ?? 300} words:\n\n${input.selection}`;
  }
}

export async function generateSuggestion(rawInput: AISuggestionInput): Promise<string> {
  const input = aiSuggestionSchema.parse(rawInput);
  const prompt = buildPrompt(input);

  const { text } = await generateText({
    model: gateway("openai/gpt-4.1-mini"),
    prompt,
    temperature: 0.4
  });

  return text.trim();
}
