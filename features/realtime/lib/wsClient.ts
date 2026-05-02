/**
 * WebSocket Public Client Singleton
 *
 * Creates a viem PublicClient with WebSocket transport for real-time event
 * watching on the Diamond proxy contract. SSR-safe — returns null when
 * running on the server or when NEXT_PUBLIC_WS_RPC_URL is not configured.
 */

import { createPublicClient, webSocket } from "viem";

import { ACTIVE_CHAIN } from "@/lib/oddmaki/chain";

let wsClient: any = null;

export function getWsPublicClient() {
  if (typeof window === "undefined") return null;

  const wsUrl = process.env.NEXT_PUBLIC_WS_RPC_URL;

  if (!wsUrl) return null;

  if (wsClient) return wsClient;

  wsClient = createPublicClient({
    chain: ACTIVE_CHAIN,
    transport: webSocket(wsUrl, {
      reconnect: {
        attempts: 10,
        delay: 2000,
      },
      keepAlive: {
        interval: 30_000,
      },
    }),
  });

  return wsClient;
}

export function destroyWsPublicClient() {
  wsClient = null;
}

export function isWsConfigured(): boolean {
  return typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_WS_RPC_URL;
}
