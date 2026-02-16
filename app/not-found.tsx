import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 pt-28 text-center">
      <span className="font-display text-8xl font-extrabold tracking-tighter text-text/10">
        404
      </span>
      <p className="mt-2 text-lg text-muted">Page not found</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground shadow-sm hover:brightness-110 transition-all"
      >
        Go home
      </Link>
    </main>
  );
}
