"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { useAccount } from "wagmi";

import { useAssertOutcome } from "../hooks/useAssertOutcome";

interface AssertOutcomeFormProps {
  marketId: string;
  outcomes: string[];
  requiredBond: bigint;
  liveness: bigint;
}

function formatBond(bond: bigint): string {
  // Bond is in USDC (6 decimals)
  const num = Number(bond) / 1e6;

  return num.toFixed(2);
}

function formatLiveness(seconds: bigint): string {
  const s = Number(seconds);

  if (s >= 86400) return `${Math.floor(s / 86400)}d`;
  if (s >= 3600) return `${Math.floor(s / 3600)}h`;

  return `${Math.floor(s / 60)}m`;
}

export function AssertOutcomeForm({
  marketId,
  outcomes,
  requiredBond,
  liveness,
}: AssertOutcomeFormProps) {
  const { isConnected } = useAccount();
  const { assertOutcome, isLoading } = useAssertOutcome(marketId);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);

  const handleAssert = async () => {
    if (!selectedOutcome) return;
    await assertOutcome(selectedOutcome);
    setSelectedOutcome(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-default-500 mb-2">
          Select the outcome you believe is correct. You must post a bond of{" "}
          <span className="font-semibold">
            ${formatBond(requiredBond)} USDC
          </span>
          . If unchallenged for{" "}
          <span className="font-semibold">{formatLiveness(liveness)}</span>, the
          assertion will be accepted.
        </p>
      </div>

      <div className="flex gap-2">
        {outcomes.map((outcome, i) => (
          <Button
            key={outcome}
            className="flex-1"
            color={
              selectedOutcome === outcome
                ? i === 0
                  ? "primary"
                  : "secondary"
                : "default"
            }
            size="sm"
            variant={selectedOutcome === outcome ? "solid" : "bordered"}
            onPress={() => setSelectedOutcome(outcome)}
          >
            {outcome}
          </Button>
        ))}
      </div>

      <Button
        className="w-full"
        color="primary"
        isDisabled={!isConnected || !selectedOutcome}
        isLoading={isLoading}
        onPress={handleAssert}
      >
        {!isConnected
          ? "Connect Wallet"
          : selectedOutcome
            ? `Assert "${selectedOutcome}" (Bond: $${formatBond(requiredBond)})`
            : "Select an outcome"}
      </Button>
    </div>
  );
}
