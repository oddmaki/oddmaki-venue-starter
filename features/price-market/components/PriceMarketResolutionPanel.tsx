"use client";

import type { PriceMarketData } from "@oddmaki-protocol/sdk";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useAccount } from "wagmi";

import { useResolvePriceMarket } from "../hooks/useResolvePriceMarket";
import { formatCountdown } from "../lib/format";

interface PriceMarketResolutionPanelProps {
  marketId: bigint;
  canResolve: boolean;
  data: PriceMarketData;
}

export function PriceMarketResolutionPanel({
  marketId,
  canResolve,
  data,
}: PriceMarketResolutionPanelProps) {
  const { isConnected } = useAccount();
  const { resolvePriceMarket, isLoading } = useResolvePriceMarket(marketId);

  const now = Math.floor(Date.now() / 1000);
  const isBeforeClose = now < Number(data.closeTime);

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <h2 className="text-lg font-semibold">On-Chain Resolution</h2>
        <p className="text-sm text-default-400 mt-1">
          Resolve using verified Pyth Network price data. Permissionless — no
          bond required.
        </p>
      </CardHeader>
      <CardBody>
        {isBeforeClose ? (
          <p className="text-sm text-default-500">
            Market closes in{" "}
            <span className="font-semibold">
              {formatCountdown(data.closeTime)}
            </span>
            . Resolution will be available after close.
          </p>
        ) : canResolve ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-default-500">
              The market has closed. Anyone can resolve it on-chain using Pyth
              price data.
            </p>
            <Button
              className="w-full"
              color="primary"
              isDisabled={!isConnected}
              isLoading={isLoading}
              onPress={resolvePriceMarket}
            >
              {!isConnected ? "Connect Wallet" : "Resolve with Pyth"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-default-400">
            This market has already been resolved.
          </p>
        )}
      </CardBody>
    </Card>
  );
}
