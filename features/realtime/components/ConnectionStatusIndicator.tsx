"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@heroui/tooltip";

import {
  useRealtimeStatus,
  type ConnectionStatus,
} from "../hooks/useRealtimeConnection";

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; label: string }
> = {
  connected: { color: "bg-primary", label: "Live" },
  connecting: { color: "bg-secondary animate-pulse", label: "Connecting..." },
  disconnected: { color: "bg-danger", label: "Disconnected" },
  unavailable: { color: "bg-default-300", label: "Polling" },
};

export function ConnectionStatusIndicator() {
  const [mounted, setMounted] = useState(false);
  const { status, eventCount, lastEventAt } = useRealtimeStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const config = STATUS_CONFIG[status];

  const tooltipContent =
    status === "connected"
      ? `Live updates active | ${eventCount} events received${
          lastEventAt
            ? ` | Last: ${new Date(lastEventAt).toLocaleTimeString()}`
            : ""
        }`
      : status === "unavailable"
        ? "Real-time updates unavailable. Using polling fallback."
        : config.label;

  return (
    <Tooltip content={tooltipContent} placement="bottom">
      <div className="flex items-center gap-1.5 cursor-default px-1">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-xs text-default-500 hidden sm:inline">
          {config.label}
        </span>
      </div>
    </Tooltip>
  );
}
