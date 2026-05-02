"use client";

import type { AuthProviderProps } from "../../types";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClientProvider } from "@tanstack/react-query";

import { authConfig } from "../../config";
import { queryClient } from "../../utils/query-client";

import { privyConfig } from "./privy-config";
import { privyWagmiConfig } from "./privy-wagmi-config";

export function PrivyAuthProvider({ children }: AuthProviderProps) {
  if (!authConfig.privy.appId) {
    throw new Error(
      "[auth] NEXT_PUBLIC_PRIVY_APP_ID is required when using the Privy provider. " +
        "Get your app ID from https://dashboard.privy.io",
    );
  }

  return (
    <PrivyProvider appId={authConfig.privy.appId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyWagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
