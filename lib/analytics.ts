import posthog from "posthog-js";

type EventProperties = Record<string, boolean | number | string>;

export function captureEvent(eventName: string, properties?: EventProperties) {
  if (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    posthog.capture(eventName, properties);
  }
}
