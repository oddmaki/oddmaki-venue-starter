"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";

export type StatusFilter = "Active" | "Resolved";

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: "Active", label: "Active" },
  { key: "Resolved", label: "Resolved" },
];

interface MarketStatusFilterProps {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
}

export function MarketStatusFilter({
  value,
  onChange,
}: MarketStatusFilterProps) {
  return (
    <Dropdown placement="bottom-start">
      <DropdownTrigger>
        <Button
          endContent={
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          }
          size="sm"
          variant="bordered"
        >
          {value}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter by market status"
        selectedKeys={new Set([value])}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as StatusFilter;

          if (selected) onChange(selected);
        }}
      >
        {STATUS_OPTIONS.map((option) => (
          <DropdownItem key={option.key}>{option.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
