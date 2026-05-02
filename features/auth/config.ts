/**
 * Auth Provider Configuration
 *
 * Reads NEXT_PUBLIC_AUTH_PROVIDER and provider-specific env vars.
 * Validates at import time so missing config fails fast.
 */

import type { AuthProviderType } from "./types";

const raw = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "rainbowkit";

function validateProvider(value: string): AuthProviderType {
  if (value === "privy" || value === "rainbowkit") return value;
  console.warn(
    `[auth] Invalid NEXT_PUBLIC_AUTH_PROVIDER="${value}", falling back to "rainbowkit"`,
  );

  return "rainbowkit";
}

export const authConfig = {
  provider: validateProvider(raw),
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "",
  },
} as const;
