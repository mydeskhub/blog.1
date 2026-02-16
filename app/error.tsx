"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 pt-28 text-center">
      <h1 className="font-display text-2xl font-bold text-text">Something went wrong</h1>
      <p className="mt-3 text-muted">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-sm hover:brightness-110 transition-all"
      >
        Try again
      </button>
    </main>
  );
}
