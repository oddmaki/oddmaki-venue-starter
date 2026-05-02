"use client";

import { Button } from "@heroui/button";

interface RefreshButtonProps {
  onRefresh: () => void;
  isFetching?: boolean;
}

export function RefreshButton({ onRefresh, isFetching }: RefreshButtonProps) {
  return (
    <Button
      isIconOnly
      aria-label="Refresh"
      className="min-w-6 w-6 h-6"
      size="sm"
      variant="light"
      onPress={onRefresh}
    >
      <svg
        className={isFetching ? "animate-spin" : ""}
        fill="none"
        height="14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
    </Button>
  );
}
