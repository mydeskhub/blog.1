"use client";

import { useState } from "react";

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
        body: JSON.stringify({ mode, tone, selection })
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
    <aside className="card ai-panel">
      <h3 style={{ marginTop: 0 }}>AI Assistant</h3>
      <p style={{ marginTop: 0, color: "var(--muted)", fontSize: "0.92rem" }}>
        Suggestions are optional. You keep full authorship control.
      </p>

      <label>
        Mode
        <select className="select" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="rephrase">Rephrase</option>
          <option value="tone">Tone edit</option>
          <option value="grammar">Grammar fix</option>
          <option value="outline">Generate outline</option>
          <option value="expand">Expand section</option>
        </select>
      </label>

      {mode === "tone" && (
        <label style={{ display: "block", marginTop: "0.6rem" }}>
          Tone
          <input className="input" value={tone} onChange={(e) => setTone(e.target.value)} />
        </label>
      )}

      <button className="button primary" style={{ marginTop: "0.8rem" }} disabled={loading} onClick={runSuggestion}>
        {loading ? "Generating..." : "Suggest"}
      </button>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      {suggestion && (
        <>
          <div
            style={{
              marginTop: "0.8rem",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "0.7rem",
              whiteSpace: "pre-wrap",
              maxHeight: 240,
              overflow: "auto",
              fontSize: "0.94rem"
            }}
          >
            {suggestion}
          </div>
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.6rem" }}>
            <button className="button primary" onClick={() => onApply(suggestion)}>
              Accept
            </button>
            <button className="button" onClick={() => setSuggestion("")}>
              Reject
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
