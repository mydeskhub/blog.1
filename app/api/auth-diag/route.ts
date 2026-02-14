import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { createActionURL } from "@auth/core";
import { authConfig } from "@/lib/auth";

export async function GET() {
  const steps: Record<string, unknown> = {};

  // Step 1: createActionURL (same as signIn server action)
  try {
    const hdrs = await nextHeaders();
    const proto = hdrs.get("x-forwarded-proto");
    const url = createActionURL(
      "signin",
      // @ts-expect-error proto can be null at runtime, NextAuth handles this
      proto,
      hdrs,
      process.env,
      authConfig
    );
    steps.createActionURL = { ok: true, url: url.toString() };
  } catch (e) {
    steps.createActionURL = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Step 2: Check basePath
  steps.basePath = authConfig.basePath ?? "(not set, will default)";

  // Step 3: Simulate provider normalization (same as parseProviders)
  try {
    const providers = authConfig.providers.map((p) => {
      const provider = typeof p === "function" ? p() : p;
      const { options: userOptions, ...defaults } = provider as unknown as Record<string, unknown> & { options?: Record<string, unknown> };
      return {
        id: (userOptions?.id ?? defaults.id) as string,
        type: defaults.type,
        hasAuthorizationUrl: Boolean(defaults.authorization),
        authorizationType: typeof defaults.authorization,
        authorizationValue:
          typeof defaults.authorization === "string"
            ? defaults.authorization.substring(0, 80)
            : defaults.authorization
            ? JSON.stringify(Object.keys(defaults.authorization as object))
            : null,
        hasIssuer: Boolean(defaults.issuer),
        issuer: defaults.issuer ?? null,
        userOptionsKeys: userOptions ? Object.keys(userOptions) : [],
        userOptionsAuthType: userOptions?.authorization
          ? typeof userOptions.authorization
          : "not set",
      };
    });
    steps.providers = providers;
  } catch (e) {
    steps.providers = {
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Step 4: Actually try normalizing the Twitter authorization endpoint
  try {
    const twitterDefault = "https://x.com/i/oauth2/authorize?scope=users.read tweet.read offline.access";
    const parsed = new URL(twitterDefault);
    steps.twitterAuthUrl = {
      ok: true,
      host: parsed.host,
      pathname: parsed.pathname,
    };
  } catch (e) {
    steps.twitterAuthUrl = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  // Step 5: Simulate the full Auth() call path
  try {
    const hdrs = await nextHeaders();
    const proto = hdrs.get("x-forwarded-proto") ?? "https";
    const signInURL = createActionURL("signin", proto, hdrs, process.env, authConfig);
    const fullUrl = `${signInURL}/twitter?`;
    const testUrl = new URL(fullUrl);
    steps.fullSignInUrl = { ok: true, url: testUrl.toString() };

    // Simulate Auth request parsing
    const req = new Request(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ callbackUrl: "/dashboard" }).toString(),
    });
    const reqUrl = new URL(req.url);
    steps.requestParse = { ok: true, pathname: reqUrl.pathname, origin: reqUrl.origin };
  } catch (e) {
    steps.fullSignInUrl = {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack?.split("\n").slice(0, 3) : null,
    };
  }

  return NextResponse.json({ steps });
}
