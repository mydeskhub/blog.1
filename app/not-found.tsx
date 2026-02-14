import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 pt-24 text-center">
      <h1 className="text-6xl font-bold text-text">404</h1>
      <p className="mt-4 text-lg text-muted">Page not found</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        Go home
      </Link>
    </main>
  );
}
