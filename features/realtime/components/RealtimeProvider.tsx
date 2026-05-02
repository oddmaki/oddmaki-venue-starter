"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getWsPublicClient,
  destroyWsPublicClient,
  isWsConfigured,
} from "../lib/wsClient";
import { diamondEventsAbi } from "../lib/diamondEventsAbi";
import { ctfEventsAbi } from "../lib/ctfEventsAbi";
import { eventToInvalidationKeys } from "../lib/eventToInvalidation";
import { createInvalidationDebouncer } from "../lib/debounce";
import {
  RealtimeContext,
  type ConnectionStatus,
  type RealtimeContextValue,
} from "../hooks/useRealtimeConnection";

import { DIAMOND_ADDRESS, CTF_ADDRESS } from "@/lib/oddmaki/constants";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("unavailable");
  const [eventCount, setEventCount] = useState(0);
  const [lastEventAt, setLastEventAt] = useState<number | null>(null);
  const unwatchRefs = useRef<(() => void)[]>([]);
  const debouncerRef = useRef<ReturnType<
    typeof createInvalidationDebouncer
  > | null>(null);
  const followUpTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Subgraph indexing lags behind the chain by a few seconds. When we
  // invalidate immediately after a WSS event, the subgraph often returns
  // stale data. The follow-up invalidation 4s later catches the indexed data.
  const FOLLOW_UP_DELAY_MS = 4000;

  const handleInvalidations = useCallback(
    (keys: readonly (readonly unknown[])[]) => {
      const invalidate = () => {
        for (const key of keys) {
          queryClient.invalidateQueries({ queryKey: key as unknown[] });
        }
      };

      // Immediate invalidation (may get fresh data if subgraph is fast)
      invalidate();

      // Follow-up invalidation to catch subgraph indexing lag
      const timer = setTimeout(() => {
        followUpTimers.current.delete(timer);
        invalidate();
      }, FOLLOW_UP_DELAY_MS);

      followUpTimers.current.add(timer);
    },
    [queryClient],
  );

  useEffect(() => {
    // Check on the client side (this effect only runs client-side)
    if (!isWsConfigured()) {
      setStatus("unavailable");

      return;
    }

    setStatus("connecting");

    const client = getWsPublicClient();

    if (!client) {
      setStatus("unavailable");

      return;
    }

    const debouncer = createInvalidationDebouncer(handleInvalidations, 300);

    debouncerRef.current = debouncer;

    const onLogs = (logs: any[]) => {
      setStatus("connected");
      for (const log of logs) {
        const eventName = (log as any).eventName as string | undefined;
        const args = (log as any).args as Record<string, unknown> | undefined;

        if (!eventName) continue;

        const keys = eventToInvalidationKeys(eventName, args ?? {});

        if (keys.length > 0) {
          console.log(`[realtime] ${eventName}`, args, "→ invalidating", keys);
          debouncer.add(keys);
        }
      }
      setEventCount((prev) => prev + logs.length);
      setLastEventAt(Date.now());
    };

    const onError = (error: Error) => {
      console.warn("[realtime] WebSocket error:", error.message);
      setStatus("disconnected");
    };

    try {
      // Watch Diamond proxy events (orders, markets, resolution, etc.)
      unwatchRefs.current.push(
        client.watchContractEvent({
          address: DIAMOND_ADDRESS,
          abi: diamondEventsAbi as any,
          onLogs,
          onError,
        }),
      );

      // Watch CTF events (split/merge positions)
      unwatchRefs.current.push(
        client.watchContractEvent({
          address: CTF_ADDRESS,
          abi: ctfEventsAbi as any,
          onLogs,
          onError,
        }),
      );
    } catch (err) {
      console.warn("[realtime] Failed to start event watcher:", err);
      setStatus("disconnected");
    }

    return () => {
      for (const unwatch of unwatchRefs.current) {
        unwatch();
      }
      unwatchRefs.current = [];
      debouncer.destroy();
      debouncerRef.current = null;
      followUpTimers.current.forEach((timer) => clearTimeout(timer));
      followUpTimers.current.clear();
      destroyWsPublicClient();
    };
  }, [handleInvalidations]);

  const contextValue = useMemo<RealtimeContextValue>(
    () => ({ status, eventCount, lastEventAt }),
    [status, eventCount, lastEventAt],
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}
