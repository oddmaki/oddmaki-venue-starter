"use client";

import NextLink from "next/link";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { parseAncillaryData } from "@oddmaki-protocol/sdk";

interface TraderActivityFeedProps {
  trades: any[];
  isLoading: boolean;
}

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor(Date.now() / 1000 - parseInt(timestamp));

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;

  return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
}

function formatAmount(amount: string, decimals: number = 6): string {
  const num = parseFloat(amount) / Math.pow(10, decimals);

  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;

  return num.toFixed(1);
}

export function TraderActivityFeed({
  trades,
  isLoading,
}: TraderActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold">Activity</h2>
        </CardHeader>
        <CardBody className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded mb-2" />
          ))}
        </CardBody>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader className="px-4 pt-4 pb-0">
          <h2 className="text-lg font-semibold">Activity</h2>
        </CardHeader>
        <CardBody className="p-4">
          <p className="text-sm text-default-500">No trading activity yet</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-4 pb-0">
        <h2 className="text-lg font-semibold">Activity</h2>
      </CardHeader>
      <CardBody className="p-4 flex flex-col gap-0">
        {trades.map((trade: any) => {
          const market = trade.market;
          const decimals = market.collateralDecimals || 6;
          const isBuy = trade.side === "BUY";
          const outcomeIndex = parseInt(trade.outcome);
          const outcomeName =
            market.outcomes?.[outcomeIndex] ||
            (outcomeIndex === 0 ? "Yes" : "No");
          const cost = parseFloat(trade.cost) / Math.pow(10, decimals);

          return (
            <div
              key={trade.id}
              className="flex items-center justify-between py-2.5 border-b border-default-100 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Chip
                  className="shrink-0"
                  color={isBuy ? "success" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {trade.side}
                </Chip>
                <div className="min-w-0">
                  <NextLink
                    className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
                    href={`/market/${market.marketId}`}
                  >
                    {parseAncillaryData(market.question).title}
                  </NextLink>
                  <div className="flex items-center gap-1.5 text-xs text-default-500">
                    <span>{outcomeName}</span>
                    <span>&middot;</span>
                    <span>{formatAmount(trade.amount, decimals)} shares</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 ml-2">
                <span className="text-sm font-medium">${cost.toFixed(2)}</span>
                <span className="text-xs text-default-500">
                  {formatTimeAgo(trade.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
