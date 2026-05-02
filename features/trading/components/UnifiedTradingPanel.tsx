"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";

import { LimitOrderForm } from "./LimitOrderForm";
import { MarketOrderForm } from "./MarketOrderForm";
import { TradingModeDropdown } from "./TradingModeDropdown";
import { SplitModal } from "./SplitModal";
import { MergeModal } from "./MergeModal";

import { useOrderbookLevels } from "@/features/orderbook/hooks/useOrderbookLevels";

interface UnifiedTradingPanelProps {
  marketId: string;
  outcomes: string[];
  tickSize: string;
  /** Fallback prices (0–100) from subgraph when orderbook is empty */
  yesPrice?: number;
  noPrice?: number;
}

export function UnifiedTradingPanel({
  marketId,
  outcomes,
  tickSize,
  yesPrice,
  noPrice,
}: UnifiedTradingPanelProps) {
  const [mode, setMode] = useState<"market" | "limit">("limit");
  const [outcomeIndex, setOutcomeIndex] = useState<0 | 1>(0);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [prefillPrice, setPrefillPrice] = useState<string | undefined>();
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // Fetch orderbook for both outcomes to display prices on outcome buttons
  const { data: outcome0Book } = useOrderbookLevels(marketId, 0, tickSize);
  const { data: outcome1Book } = useOrderbookLevels(marketId, 1, tickSize);
  // Use the selected outcome's book for mode detection
  const orderbook = outcomeIndex === 0 ? outcome0Book : outcome1Book;
  const hasSetDefaultRef = useRef(false);

  useEffect(() => {
    if (orderbook && !hasSetDefaultRef.current) {
      hasSetDefaultRef.current = true;
      const hasOrders = orderbook.bids.length > 0 || orderbook.asks.length > 0;

      setMode(hasOrders ? "market" : "limit");
    }
  }, [orderbook]);

  const outcomeName =
    outcomes[outcomeIndex] || (outcomeIndex === 0 ? "Yes" : "No");

  // Derive outcome prices in cents from each outcome's orderbook
  const getMidPrice = (book: typeof outcome0Book) => {
    if (book?.bestBidPrice && book?.bestAskPrice)
      return (
        (parseFloat(book.bestBidPrice) + parseFloat(book.bestAskPrice)) / 2
      );
    if (book?.bestAskPrice) return parseFloat(book.bestAskPrice);
    if (book?.bestBidPrice) return parseFloat(book.bestBidPrice);

    return null;
  };
  const mid0 = getMidPrice(outcome0Book);
  const mid1 = getMidPrice(outcome1Book);
  // Use orderbook midpoint, then complement, then subgraph fallback
  const outcome0Cents =
    mid0 != null
      ? Math.round(mid0 * 100)
      : mid1 != null
        ? 100 - Math.round(mid1 * 100)
        : yesPrice != null
          ? Math.round(yesPrice)
          : null;
  const outcome1Cents =
    mid1 != null
      ? Math.round(mid1 * 100)
      : mid0 != null
        ? 100 - Math.round(mid0 * 100)
        : noPrice != null
          ? Math.round(noPrice)
          : null;

  // Current outcome price as decimal string for LimitOrderForm default
  const currentOutcomePrice =
    outcomeIndex === 0
      ? outcome0Cents != null
        ? (outcome0Cents / 100).toFixed(2)
        : undefined
      : outcome1Cents != null
        ? (outcome1Cents / 100).toFixed(2)
        : undefined;

  /** Called from parent (OrderbookPanel) to prefill a price */
  const handlePriceClick = useCallback((price: string) => {
    setPrefillPrice(price);
    setMode("limit");
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 pb-0">
          {/* Row 1: Buy/Sell toggle (left) + Mode dropdown (right) */}
          <div className="flex justify-between items-center w-full">
            <Tabs
              classNames={{ tabList: "gap-0 w-auto", tab: "px-4" }}
              color={side === "BUY" ? "primary" : "secondary"}
              selectedKey={side}
              size="sm"
              variant="underlined"
              onSelectionChange={(key) => setSide(key as "BUY" | "SELL")}
            >
              <Tab key="BUY" title="Buy" />
              <Tab key="SELL" title="Sell" />
            </Tabs>

            <TradingModeDropdown
              mode={mode}
              onMergeOpen={() => setMergeModalOpen(true)}
              onModeChange={setMode}
              onSplitOpen={() => setSplitModalOpen(true)}
            />
          </div>

          {/* Row 2: Outcome selector */}
          <div className="flex gap-1 w-full">
            <Button
              className="flex-1"
              color={outcomeIndex === 0 ? "primary" : "default"}
              size="sm"
              variant={outcomeIndex === 0 ? "solid" : "flat"}
              onPress={() => setOutcomeIndex(0)}
            >
              {outcomes[0] || "Yes"}
              {outcome0Cents != null ? ` ${outcome0Cents}¢` : ""}
            </Button>
            <Button
              className="flex-1"
              color={outcomeIndex === 1 ? "secondary" : "default"}
              size="sm"
              variant={outcomeIndex === 1 ? "solid" : "flat"}
              onPress={() => setOutcomeIndex(1)}
            >
              {outcomes[1] || "No"}
              {outcome1Cents != null ? ` ${outcome1Cents}¢` : ""}
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {mode === "market" ? (
            <MarketOrderForm
              marketId={marketId}
              outcomeIndex={outcomeIndex}
              outcomeName={outcomeName}
              side={side}
              tickSize={tickSize}
            />
          ) : (
            <LimitOrderForm
              marketId={marketId}
              outcomeIndex={outcomeIndex}
              outcomeName={outcomeName}
              prefillPrice={prefillPrice || currentOutcomePrice}
              side={side}
            />
          )}
        </CardBody>
      </Card>

      <SplitModal
        isOpen={splitModalOpen}
        marketId={marketId}
        outcomes={outcomes}
        onClose={() => setSplitModalOpen(false)}
      />
      <MergeModal
        isOpen={mergeModalOpen}
        marketId={marketId}
        outcomes={outcomes}
        onClose={() => setMergeModalOpen(false)}
      />
    </>
  );
}
