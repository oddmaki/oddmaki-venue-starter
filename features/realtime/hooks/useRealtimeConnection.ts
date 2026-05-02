"use client";

import { createContext, useContext } from "react";

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "unavailable";

export interface RealtimeContextValue {
  status: ConnectionStatus;
  eventCount: number;
  lastEventAt: number | null;
}

export const RealtimeContext = createContext<RealtimeContextValue>({
  status: "unavailable",
  eventCount: 0,
  lastEventAt: null,
});

/**
 * Returns the current WebSocket connection status.
 *
 * - 'connected' — actively receiving events
 * - 'connecting' — initial connection or reconnecting
 * - 'disconnected' — WSS error, will retry
 * - 'unavailable' — NEXT_PUBLIC_WS_RPC_URL not set, using polling fallback
 */
export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
