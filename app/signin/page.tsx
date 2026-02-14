import { signIn } from "@/lib/auth";

const baseUrl = (process.env.NEXTAUTH_URL ?? "").trim();

function getRedirectUrl(path: string) {
  if (!baseUrl) return path;
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

export default function SignInPage() {
  return (
    <main className="container" style={{ paddingTop: "1.5rem" }}>
      <section className="card" style={{ maxWidth: 460 }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: getRedirectUrl("/dashboard") });
          }}
        >
          <button className="button primary" type="submit">
            Continue with Google
          </button>
        </form>
        <form
          style={{ marginTop: "0.8rem" }}
          action={async () => {
            "use server";
            await signIn("twitter", { redirectTo: getRedirectUrl("/dashboard") });
          }}
        >
          <button className="button" type="submit">
            Continue with Twitter
          </button>
        </form>
      </section>
    </main>
  );
}
