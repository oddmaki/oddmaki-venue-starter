"use client";

import { Button } from "@heroui/button";

import { useResolvePriceMarket } from "../hooks/useResolvePriceMarket";

interface PriceMarketResolveButtonProps {
  marketId: bigint;
  canResolve: boolean;
}

export function PriceMarketResolveButton({
  marketId,
  canResolve,
}: PriceMarketResolveButtonProps) {
  const { resolvePriceMarket, isLoading } = useResolvePriceMarket(marketId);

  if (!canResolve) return null;

  return (
    <Button
      color="primary"
      isLoading={isLoading}
      size="sm"
      variant="flat"
      onPress={resolvePriceMarket}
    >
      Resolve On-Chain
    </Button>
  );
}
