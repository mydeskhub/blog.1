"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

type AIPaneProps = {
  onApply: (suggestion: string) => void;
  getSelection: () => string;
};

type Mode = "rephrase" | "tone" | "grammar" | "outline" | "expand";

export function AIPane({ onApply, getSelection }: AIPaneProps) {
  const [mode, setMode] = useState<Mode>("rephrase");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function runSuggestion() {
    setLoading(true);
    setError(null);

    try {
      const selection = getSelection();
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, tone, selection }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate AI suggestion");
      }

      const data = (await response.json()) as { suggestion: string };
      setSuggestion(data.suggestion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="sticky top-20 self-start rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-accent" />
        <h3 className="font-bold text-text">AI Assistant</h3>
      </div>
      <p className="text-xs text-muted mb-4">
        Suggestions are optional. You keep full authorship control.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-text mb-1 block">Mode</label>
          <Select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="rephrase">Rephrase</option>
            <option value="tone">Tone edit</option>
            <option value="grammar">Grammar fix</option>
            <option value="outline">Generate outline</option>
            <option value="expand">Expand section</option>
          </Select>
        </div>

        {mode === "tone" && (
          <div>
            <label className="text-xs font-medium text-text mb-1 block">Tone</label>
            <Input value={tone} onChange={(e) => setTone(e.target.value)} />
          </div>
        )}

        <Button
          variant="primary"
          className="w-full"
          disabled={loading}
          onClick={runSuggestion}
        >
          {loading ? "Generating..." : "Suggest"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {suggestion && (
        <div className="mt-4">
          <div className="rounded-lg border border-line p-3 text-sm whitespace-pre-wrap max-h-60 overflow-auto">
            {suggestion}
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="primary" size="sm" onClick={() => onApply(suggestion)}>
              Accept
            </Button>
            <Button size="sm" onClick={() => setSuggestion("")}>
              Reject
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
