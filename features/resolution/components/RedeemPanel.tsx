"use client";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { useAccount } from "wagmi";

import { useRedeemWinnings } from "../hooks/useRedeemWinnings";
import { useMarketStatus } from "../hooks/useMarketStatus";

import { useUserPositions } from "@/features/market-detail/hooks/useUserPositions";

interface RedeemPanelProps {
  marketId: string;
  outcomes: string[];
  winningOutcome?: string;
  standalone?: boolean;
}

export function RedeemPanel({
  marketId,
  outcomes,
  winningOutcome: winningOutcomeProp,
  standalone = false,
}: RedeemPanelProps) {
  const { isConnected } = useAccount();
  const { data: positions } = useUserPositions(marketId);
  const { redeemWinnings, isLoading } = useRedeemWinnings(marketId);
  const { data: status, isLoading: statusLoading } = useMarketStatus(marketId);

  const winningOutcome =
    winningOutcomeProp ?? status?.resolution.winningOutcome ?? null;

  if (standalone && !winningOutcomeProp && statusLoading) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Redeem Winnings</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!winningOutcome) return null;

  const winningIndex =
    winningOutcome === "YES" ? 0 : winningOutcome === "NO" ? 1 : -1;
  const winningLabel =
    winningIndex >= 0
      ? outcomes[winningIndex] || winningOutcome
      : winningOutcome;

  const winningBalance =
    winningOutcome === "YES"
      ? positions?.YES || "0"
      : winningOutcome === "NO"
        ? positions?.NO || "0"
        : "0";

  const hasWinnings = parseFloat(winningBalance) > 0;

  const content = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-default-500">Winning outcome:</span>
        <Chip
          color={
            winningOutcome === "YES"
              ? "primary"
              : winningOutcome === "NO"
                ? "secondary"
                : "warning"
          }
          size="sm"
          variant="flat"
        >
          {winningLabel}
        </Chip>
      </div>

      {hasWinnings ? (
        <>
          <p className="text-sm text-default-500">
            You hold <span className="font-semibold">{winningBalance}</span>{" "}
            winning tokens redeemable for USDC.
          </p>
          <Button
            className="w-full"
            color="primary"
            isDisabled={!isConnected}
            isLoading={isLoading}
            onPress={redeemWinnings}
          >
            {!isConnected ? "Connect Wallet" : "Redeem Winnings"}
          </Button>
        </>
      ) : (
        <p className="text-sm text-default-400">
          You have no winning tokens to redeem.
        </p>
      )}
    </div>
  );

  if (standalone) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Redeem Winnings</h2>
        </CardHeader>
        <CardBody>{content}</CardBody>
      </Card>
    );
  }

  return content;
}
