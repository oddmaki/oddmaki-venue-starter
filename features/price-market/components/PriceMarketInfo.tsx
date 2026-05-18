"use client";

import type {
  PriceMarketData,
  ProjectedOpenPrice,
} from "@oddmaki-protocol/sdk";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";

import { PYTH_FEED_MAP } from "../constants/pythFeeds";
import { formatPythPrice, formatCountdown } from "../lib/format";

interface PriceMarketInfoProps {
  data: PriceMarketData;
  outcomes?: string[];
  /**
   * For deferred Up/Down markets the on-chain strike is 0 until resolution.
   * Pass the SDK-projected open price so the UI can show a meaningful
   * reference price. `null` for resolved or explicit-strike markets, or while
   * a scheduled market hasn't reached its `openTime`.
   */
  projectedOpenPrice?: ProjectedOpenPrice | null;
}

export function PriceMarketInfo({
  data,
  outcomes,
  projectedOpenPrice,
}: PriceMarketInfoProps) {
  const feed = PYTH_FEED_MAP.get(data.feedId);
  const feedName = feed?.symbol || data.feedId.slice(0, 10) + "...";

  const isStrikePending = !data.resolved && data.strikePrice === BigInt(0);
  const effectiveStrike =
    isStrikePending && projectedOpenPrice
      ? projectedOpenPrice.price
      : data.strikePrice;
  const strikeFormatted = formatPythPrice(effectiveStrike, data.priceExpo);
  const showStrike = !isStrikePending || !!projectedOpenPrice;
  const strikeNotYetCanonical =
    isStrikePending && !!projectedOpenPrice && !projectedOpenPrice.canonical;

  return (
    <Card className="bg-default-50">
      <CardBody className="gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-default-500">Price Feed</span>
          <Chip color="primary" size="sm" variant="flat">
            {feedName}
          </Chip>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-default-500">
            Reference Price
            {strikeNotYetCanonical ? (
              <span className="ml-1 text-warning">(pending)</span>
            ) : null}
          </span>
          {showStrike ? (
            <span className="font-mono text-sm font-semibold">
              ${strikeFormatted}
            </span>
          ) : (
            <span className="text-sm text-default-400">Set at market open</span>
          )}
        </div>

        {data.resolved ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Final Price</span>
              <span className="font-mono text-sm">
                ${formatPythPrice(data.finalPrice, data.priceExpo)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Outcome</span>
              <Chip
                color={
                  data.finalPrice && data.finalPrice >= data.strikePrice
                    ? "primary"
                    : "secondary"
                }
                size="sm"
              >
                {data.finalPrice && data.finalPrice >= data.strikePrice
                  ? (outcomes?.[0] ?? "Up")
                  : (outcomes?.[1] ?? "Down")}
              </Chip>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-default-500">Closes In</span>
            <span className="font-mono text-sm">
              {formatCountdown(data.closeTime)}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
