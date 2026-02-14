"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="container" style={{ paddingTop: "1.5rem" }}>
      <section className="card" style={{ maxWidth: 460 }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <button
          className="button primary"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </button>
        <button
          className="button"
          style={{ marginTop: "0.8rem" }}
          onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
        >
          Continue with Twitter
        </button>
      </section>
    </main>
  );
}
