"use client";

import type { Trade } from "../hooks/useTradeHistory";

import NextLink from "next/link";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";

import { useTradeHistory } from "../hooks/useTradeHistory";

import { RefreshButton } from "@/lib/oddmaki/RefreshButton";
import { AddressAvatar, generatePseudonym } from "@/lib/identity";

interface RecentTradesPanelProps {
  marketId: string;
  outcomes: string[];
  tickSize: string;
}

function tickToPrice(tick: string, tickSize: string): string {
  const t = parseFloat(tick);
  const ts = parseFloat(tickSize);

  if (t === 0 || ts === 0) return "0.00";
  const price = (t * ts) / 1e18;

  return price.toFixed(2);
}

function formatQty(qty: string): string {
  const num = parseFloat(qty) / 1e6;

  if (num === 0) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  if (num < 0.01) return num.toFixed(4);

  return num.toFixed(2);
}

function formatTime(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);

  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);

  return `${diffDays}d ago`;
}

const TRADE_TYPE_LABEL: Record<string, string> = {
  OrderFill: "Fill",
  MintFill: "Mint",
  MergeFill: "Merge",
  MarketOrder: "Market",
};

export function RecentTradesPanel({
  marketId,
  outcomes,
  tickSize,
}: RecentTradesPanelProps) {
  const {
    data: allTrades,
    isLoading,
    isFetching,
    refetch,
  } = useTradeHistory(marketId);
  const trades = allTrades?.slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Trades</h2>
        <div className="flex items-center gap-2">
          {trades && trades.length > 0 && (
            <span className="text-xs text-default-400">
              {trades.length} trade{trades.length === 1 ? "" : "s"}
            </span>
          )}
          <RefreshButton isFetching={isFetching} onRefresh={() => refetch()} />
        </div>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : !trades || trades.length === 0 ? (
          <p className="text-sm text-default-400 text-center py-4">
            No trades yet
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header — hidden on mobile (card layout takes over) */}
            <div className="hidden sm:grid grid-cols-6 gap-2 text-xs text-default-400 px-2">
              <span>Trader</span>
              <span>Time</span>
              <span>Outcome</span>
              <span>Type</span>
              <span className="text-right">Price</span>
              <span className="text-right">Amount</span>
            </div>

            {trades.map((trade: Trade) => {
              const outcomeNum = parseInt(trade.outcome);
              const outcomeName =
                outcomes[outcomeNum] || (outcomeNum === 0 ? "Yes" : "No");
              const trader = trade.buyTrader ?? trade.sellTrader;
              const isBuy = trade.buyTrader !== null;

              return (
                <div
                  key={trade.id}
                  className="px-2 py-1.5 rounded-lg hover:bg-default-100"
                >
                  {/* Desktop: 6-col grid */}
                  <div className="hidden sm:grid grid-cols-6 gap-2 items-center">
                    <NextLink
                      className="flex items-center gap-1.5 hover:text-primary transition-colors min-w-0"
                      href={`/trader/${trader?.id || ""}`}
                    >
                      <AddressAvatar address={trader?.id || "0x0"} size={18} />
                      <span className="text-xs truncate">
                        {trader ? generatePseudonym(trader.id) : "—"}
                      </span>
                    </NextLink>
                    <span className="text-xs text-default-400">
                      {formatTime(trade.timestamp)}
                    </span>
                    <Chip
                      color={outcomeNum === 0 ? "primary" : "secondary"}
                      size="sm"
                      variant="flat"
                    >
                      {outcomeName}
                    </Chip>
                    <span className="text-xs text-default-500">
                      {TRADE_TYPE_LABEL[trade.tradeType] || trade.tradeType}
                    </span>
                    <span
                      className={`text-sm text-right ${
                        isBuy ? "text-primary" : "text-secondary"
                      }`}
                    >
                      {`$${tickToPrice(trade.tick, tickSize)}`}
                    </span>
                    <span className="text-sm text-right">
                      {formatQty(trade.amount)}
                    </span>
                  </div>

                  {/* Mobile: 2-row stacked card */}
                  <div className="sm:hidden flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <NextLink
                        className="flex items-center gap-1.5 hover:text-primary transition-colors min-w-0 flex-1"
                        href={`/trader/${trader?.id || ""}`}
                      >
                        <AddressAvatar
                          address={trader?.id || "0x0"}
                          size={18}
                        />
                        <span className="text-xs truncate">
                          {trader ? generatePseudonym(trader.id) : "—"}
                        </span>
                      </NextLink>
                      <Chip
                        color={outcomeNum === 0 ? "primary" : "secondary"}
                        size="sm"
                        variant="flat"
                      >
                        {outcomeName}
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-default-400">
                        {formatTime(trade.timestamp)} ·{" "}
                        {TRADE_TYPE_LABEL[trade.tradeType] || trade.tradeType}
                      </span>
                      <span className="flex items-center gap-2">
                        <span
                          className={
                            isBuy
                              ? "text-primary font-medium"
                              : "text-secondary font-medium"
                          }
                        >
                          {`$${tickToPrice(trade.tick, tickSize)}`}
                        </span>
                        <span className="text-default-500">
                          × {formatQty(trade.amount)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
