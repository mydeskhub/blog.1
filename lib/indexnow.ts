import { getBaseUrl } from "@/lib/seo";

export async function submitToIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_API_KEY;
  if (!key || urls.length === 0) return;

  const host = new URL(getBaseUrl()).host;

  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    // Fire-and-forget — never throw
  }
}
