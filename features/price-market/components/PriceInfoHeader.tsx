"use client";

import { Skeleton } from "@heroui/skeleton";

import { formatDollarPrice } from "../lib/format";

interface PriceInfoHeaderProps {
  /** Strike price as a number — may be a projection while `strikePending`. */
  strikePriceNum: number;
  /** Live price from Pyth (numeric) */
  currentPrice?: number;
  /** Whether the live price is still loading */
  isLoading: boolean;
  /** Direction of current price vs strike */
  priceDirection: "up" | "down" | null;
  /** Final price when resolved */
  finalPrice?: number;
  /** Whether the market is resolved */
  resolved?: boolean;
  /**
   * `true` when we have a strike value to display (either on-chain or a Hermes
   * projection). `false` for scheduled markets that haven't reached `openTime`
   * yet — render "Strike pending" instead of a number.
   */
  strikeKnown?: boolean;
  /**
   * `true` when the displayed strike is a Hermes projection that may still
   * shift (open window not yet fully elapsed). Renders a subtle indicator.
   */
  strikePending?: boolean;
}

export function PriceInfoHeader({
  strikePriceNum,
  currentPrice,
  isLoading,
  priceDirection,
  finalPrice,
  resolved,
  strikeKnown = true,
  strikePending = false,
}: PriceInfoHeaderProps) {
  const displayPrice = resolved ? finalPrice : currentPrice;
  const delta =
    strikeKnown && displayPrice != null ? displayPrice - strikePriceNum : null;
  const direction =
    delta != null ? (delta >= 0 ? "up" : "down") : priceDirection;

  return (
    <div className="flex items-start gap-6">
      {/* Price to Beat */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] text-default-400 uppercase tracking-wider">
          Price To Beat
          {strikePending && strikeKnown ? (
            <span className="ml-1 text-warning normal-case">(pending)</span>
          ) : null}
        </span>
        {strikeKnown ? (
          <span className="font-mono text-xl font-bold text-default-700">
            ${formatDollarPrice(strikePriceNum)}
          </span>
        ) : (
          <span className="font-mono text-xl text-default-400">
            Set at open
          </span>
        )}
      </div>

      {/* Current / Final Price */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-default-400 uppercase tracking-wider">
            {resolved ? "Final Price" : "Current Price"}
          </span>
          {delta != null && (
            <span
              className={`text-[10px] font-semibold ${
                direction === "up" ? "text-success" : "text-danger"
              }`}
            >
              {direction === "up" ? "▲" : "▼"} ${Math.abs(delta).toFixed(2)}
            </span>
          )}
        </div>
        {isLoading && !resolved ? (
          <Skeleton className="h-7 w-32 rounded" />
        ) : displayPrice !== undefined ? (
          <span
            className={`font-mono text-xl font-bold ${
              direction === "up"
                ? "text-success"
                : direction === "down"
                  ? "text-danger"
                  : "text-default-700"
            }`}
          >
            ${formatDollarPrice(displayPrice)}
          </span>
        ) : (
          <span className="font-mono text-xl text-default-400">—</span>
        )}
      </div>
    </div>
  );
}
