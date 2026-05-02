/**
 * OddMaki SDK React Hooks
 *
 * Wrapper hooks for the OddMaki Protocol SDK that integrate with Wagmi.
 */

"use client";

import { useMemo } from "react";
import { useWalletClient } from "wagmi";
import {
  createOddMakiClient,
  buildSubgraphGatewayUrl,
} from "@oddmaki-protocol/sdk";

import { ACTIVE_CHAIN } from "./chain";

/**
 * Hook to get an initialized OddMaki client
 *
 * @returns OddMaki client instance
 */
export function useOddMakiClient() {
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
    const subgraphEndpoint = apiKey
      ? buildSubgraphGatewayUrl(ACTIVE_CHAIN.id, apiKey)
      : undefined;

    return createOddMakiClient({
      chain: ACTIVE_CHAIN,
      walletClient: walletClient as any, // Cast to any to avoid version mismatches
      subgraphEndpoint,
    });
  }, [walletClient]);
}
