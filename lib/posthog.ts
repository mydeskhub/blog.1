import { PostHog } from "posthog-node";

export const posthog =
  process.env.POSTHOG_API_KEY && process.env.POSTHOG_HOST
    ? new PostHog(process.env.POSTHOG_API_KEY, { host: process.env.POSTHOG_HOST })
    : null;

export async function captureEvent(distinctId: string, event: string, properties?: Record<string, unknown>) {
  if (!posthog) return;
  posthog.capture({ distinctId, event, properties });
  await posthog.shutdown();
}
