"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 pt-24 text-center">
      <h1 className="text-3xl font-bold text-text">Something went wrong</h1>
      <p className="mt-4 text-muted">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
