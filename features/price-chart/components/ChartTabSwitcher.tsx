"use client";

import { Tabs, Tab } from "@heroui/tabs";

export type ChartTab = "probability" | "price";

interface ChartTabSwitcherProps {
  activeTab: ChartTab;
  onTabChange: (tab: ChartTab) => void;
}

export function ChartTabSwitcher({
  activeTab,
  onTabChange,
}: ChartTabSwitcherProps) {
  return (
    <Tabs
      classNames={{
        tabList: "bg-default-100/50",
        cursor: "bg-default-200",
      }}
      selectedKey={activeTab}
      size="sm"
      variant="bordered"
      onSelectionChange={(key) => onTabChange(key as ChartTab)}
    >
      <Tab
        key="probability"
        title={
          <div className="flex items-center gap-1.5 px-0.5">
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="14"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>Probability</span>
          </div>
        }
      />
      <Tab
        key="price"
        title={
          <div className="flex items-center gap-1.5 px-0.5">
            <svg
              fill="none"
              height="14"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="14"
            >
              <line x1="12" x2="12" y1="1" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Price</span>
          </div>
        }
      />
    </Tabs>
  );
}
