"use client";

import type { MarketDetail } from "../hooks/useMarketDetail";

import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useRouter } from "next/navigation";

import { useMarketPriceChange } from "../hooks/useMarketPriceChange";

import { ArrowBackIcon } from "@/components/icons";
import { MarketImage } from "@/features/markets/components/MarketImage";
import { MarketSettingsButton } from "@/features/market-settings";

interface MarketDetailHeaderProps {
  market: MarketDetail;
}

const STATUS_COLOR: Record<
  string,
  "warning" | "primary" | "default" | "danger"
> = {
  Draft: "warning",
  Active: "primary",
  Resolved: "default",
  Invalid: "danger",
};

export function MarketDetailHeader({ market }: MarketDetailHeaderProps) {
  const router = useRouter();
  const { data: priceChange } = useMarketPriceChange(
    market.marketId,
    market.tickSize,
    market.yesPrice,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <Button
            isIconOnly
            aria-label="Back to markets"
            className="mt-0.5 flex-shrink-0"
            size="sm"
            variant="light"
            onPress={() => router.push("/")}
          >
            <ArrowBackIcon size={20} />
          </Button>
          <div className="flex-shrink-0">
            <MarketImage
              metadataURI={market.metadataURI}
              name={market.title}
              size="lg"
            />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold break-words min-w-0">
            {market.title}
          </h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Chip
            color={STATUS_COLOR[market.status] || "default"}
            size="sm"
            variant="flat"
          >
            {market.status}
          </Chip>
          <MarketSettingsButton
            marketCreator={market.creator}
            marketId={market.marketId}
          />
        </div>
      </div>

      {/* Price + stats row */}
      <div className="flex flex-wrap items-end gap-4 sm:gap-6">
        {/* YES chance */}
        <div className="flex items-end gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-primary">
            {market.yesPrice}% chance
          </span>
          {priceChange && priceChange.direction !== "flat" && (
            <span
              className={`text-sm font-medium pb-1 ${
                priceChange.direction === "up" ? "text-success" : "text-danger"
              }`}
            >
              {priceChange.direction === "up" ? "\u25B2" : "\u25BC"}{" "}
              {Math.abs(priceChange.change)}%
            </span>
          )}
        </div>

        {/* Volume */}
        <div className="flex flex-col">
          <span className="text-xs text-default-400 uppercase">Volume</span>
          <span className="text-lg font-semibold">
            {market.volumeFormatted}
          </span>
        </div>

        {/* Traders */}
        <div className="flex flex-col">
          <span className="text-xs text-default-400 uppercase">Traders</span>
          <span className="text-lg font-semibold">{market.uniqueTraders}</span>
        </div>
      </div>
    </div>
  );
}
