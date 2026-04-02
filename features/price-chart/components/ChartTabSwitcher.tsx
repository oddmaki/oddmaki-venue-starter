'use client';

import { Tabs, Tab } from '@heroui/tabs';

export type ChartTab = 'probability' | 'price';

interface ChartTabSwitcherProps {
  activeTab: ChartTab;
  onTabChange: (tab: ChartTab) => void;
}

export function ChartTabSwitcher({ activeTab, onTabChange }: ChartTabSwitcherProps) {
  return (
    <Tabs
      size="sm"
      variant="bordered"
      selectedKey={activeTab}
      onSelectionChange={(key) => onTabChange(key as ChartTab)}
      classNames={{
        tabList: 'bg-default-100/50',
        cursor: 'bg-default-200',
      }}
    >
      <Tab
        key="probability"
        title={
          <div className="flex items-center gap-1.5 px-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Price</span>
          </div>
        }
      />
    </Tabs>
  );
}
