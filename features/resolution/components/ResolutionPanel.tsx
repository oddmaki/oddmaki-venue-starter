"use client";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { useConnection } from "wagmi";

import { useMarketStatus } from "../hooks/useMarketStatus";
import { useSettleAssertion } from "../hooks/useSettleAssertion";
import { useReportResolution } from "../hooks/useReportResolution";

import { ResolutionTimeline } from "./ResolutionTimeline";
import { AssertOutcomeForm } from "./AssertOutcomeForm";

interface ResolutionPanelProps {
  marketId: string;
  outcomes: string[];
  title?: string;
  description?: string;
  /** When true, renders content without Card wrapper (for embedding in Accordion, etc.) */
  bare?: boolean;
}

function formatCountdown(expirationTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = expirationTime - now;

  if (remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);

  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;

  return `${minutes}m`;
}

function shortenAddress(addr: string): string {
  if (addr.length < 10) return addr;

  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ResolutionPanel({
  marketId,
  outcomes,
  title = "Resolution",
  description,
  bare = false,
}: ResolutionPanelProps) {
  const { isConnected } = useConnection();
  const { data: status, isLoading } = useMarketStatus(marketId);
  const { settleAssertion, isLoading: isSettling } =
    useSettleAssertion(marketId);
  const { reportResolution, isLoading: isReporting } =
    useReportResolution(marketId);

  const body =
    isLoading || !status ? (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    ) : (
      <>
        {/* Vertical timeline (hidden when no assertion) */}
        <ResolutionTimeline
          assertedOutcome={status.assertion.outcome}
          isDisputed={status.assertionDetails?.isDisputed ?? false}
          phase={status.phase}
          winningOutcome={status.resolution.winningOutcome}
        />

        {/* ACTIVE_NO_ASSERTION — show assert form */}
        {status.phase === "ACTIVE_NO_ASSERTION" && (
          <AssertOutcomeForm
            liveness={status.question.liveness}
            marketId={marketId}
            outcomes={outcomes}
            requiredBond={status.question.requiredBond}
          />
        )}

        {/* ASSERTION_PENDING — show countdown + details */}
        {status.phase === "ASSERTION_PENDING" && status.assertionDetails && (
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">Asserter:</span>
              <span className="text-sm font-mono">
                {shortenAddress(status.assertionDetails.asserter)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-default-500">
                Challenge period ends:
              </span>
              <Chip color="primary" size="sm" variant="flat">
                {formatCountdown(status.assertionDetails.expirationTime)}
              </Chip>
            </div>
            <p className="text-xs text-default-400">
              The assertion is in its challenge period. If unchallenged, it can
              be settled after expiration.
            </p>
          </div>
        )}

        {/* ASSERTION_EXPIRED — show settle button */}
        {status.phase === "ASSERTION_EXPIRED" && (
          <div className="flex flex-col gap-3 mt-4">
            <p className="text-sm text-default-500">
              The challenge period has expired. Anyone can now settle the
              assertion.
            </p>
            <Button
              className="w-full"
              color="primary"
              isDisabled={!isConnected || !status.assertion.assertionId}
              isLoading={isSettling}
              onPress={() => {
                if (status.assertion.assertionId) {
                  settleAssertion(status.assertion.assertionId);
                }
              }}
            >
              {!isConnected ? "Connect Wallet" : "Settle Assertion"}
            </Button>
          </div>
        )}

        {/* SETTLED_NOT_REPORTED — show report button */}
        {status.phase === "SETTLED_NOT_REPORTED" && (
          <div className="flex flex-col gap-3 mt-4">
            <p className="text-sm text-default-500">
              The assertion has been settled. Report the resolution to the CTF
              to finalize the market.
            </p>
            <Button
              className="w-full"
              color="primary"
              isDisabled={!isConnected || !status.assertion.outcome}
              isLoading={isReporting}
              onPress={() => {
                if (status.assertion.outcome) {
                  reportResolution(status.assertion.outcome);
                }
              }}
            >
              {!isConnected ? "Connect Wallet" : "Report Resolution"}
            </Button>
          </div>
        )}
      </>
    );

  if (bare) {
    return (
      <div className="flex flex-col gap-2">
        {description && (
          <p className="text-sm text-default-400">{description}</p>
        )}
        {body}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-default-400 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardBody>{body}</CardBody>
    </Card>
  );
}
