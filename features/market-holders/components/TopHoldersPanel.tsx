"use client";

import NextLink from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

import { useMarketTopHolders } from "../hooks/useMarketTopHolders";

import { AddressAvatar, generatePseudonym } from "@/lib/identity";

interface TopHoldersPanelProps {
  marketId: string;
  outcomes: string[];
}

function formatQty(value: string, decimals: number = 6): string {
  const num = parseFloat(value) / Math.pow(10, decimals);

  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;

  return num.toFixed(0);
}

interface HolderRowProps {
  pos: any;
  rank: number;
}

function HolderRow({ pos, rank }: HolderRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-default-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-default-400 w-4 shrink-0 text-right">
          {rank}
        </span>
        <NextLink
          className="flex items-center gap-2 hover:text-primary transition-colors min-w-0"
          href={`/trader/${pos.trader.id}`}
        >
          <AddressAvatar address={pos.trader.id} size={22} />
          <span className="text-sm font-medium truncate">
            {generatePseudonym(pos.trader.id)}
          </span>
        </NextLink>
      </div>
      <span className="text-sm font-medium text-default-700 shrink-0 ml-2 tabular-nums">
        {formatQty(pos.quantity)}
      </span>
    </div>
  );
}

interface OutcomeColumnProps {
  label: string;
  holders: any[];
  colorClass: string;
}

function OutcomeColumn({ label, holders, colorClass }: OutcomeColumnProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>
        <span className="text-xs text-default-400 font-medium uppercase tracking-wide">
          Shares
        </span>
      </div>
      {holders.length === 0 ? (
        <p className="text-xs text-default-400 py-2 px-1">No positions</p>
      ) : (
        holders.map((pos, i) => (
          <HolderRow key={pos.id} pos={pos} rank={i + 1} />
        ))
      )}
    </div>
  );
}

export function TopHoldersPanel({ marketId, outcomes }: TopHoldersPanelProps) {
  const { data: holders = [], isLoading } = useMarketTopHolders(marketId);

  const outcomeLabel = (index: number) =>
    outcomes?.[index] ?? (index === 0 ? "Yes" : "No");

  if (isLoading) {
    return (
      <Card>
        <CardBody className="p-4">
          <div className="flex gap-6">
            {[0, 1].map((i) => (
              <div key={i} className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-5 w-20 rounded" />
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-9 w-full rounded" />
                ))}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (holders.length === 0) {
    return (
      <Card>
        <CardBody className="p-4">
          <p className="text-sm text-default-500">No positions yet</p>
        </CardBody>
      </Card>
    );
  }

  // Split by outcome index; keep existing sort order (quantity desc from query)
  const byOutcome: Record<number, any[]> = {};

  for (const pos of holders) {
    const idx = parseInt(pos.outcome);

    if (!byOutcome[idx]) byOutcome[idx] = [];
    byOutcome[idx].push(pos);
  }

  const outcomeIndices = Object.keys(byOutcome)
    .map(Number)
    .sort((a, b) => a - b);

  const colorClasses = ["text-success", "text-danger"];

  return (
    <Card>
      <CardBody className="p-4">
        <div className="flex gap-6">
          {outcomeIndices.map((idx) => (
            <OutcomeColumn
              key={idx}
              colorClass={colorClasses[idx] ?? "text-default-700"}
              holders={byOutcome[idx]}
              label={`${outcomeLabel(idx)} holders`}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
