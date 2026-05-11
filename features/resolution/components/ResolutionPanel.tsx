"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Tooltip } from "@heroui/tooltip";
import { useConnection } from "wagmi";

import { useMarketStatus } from "../hooks/useMarketStatus";
import { useSettleAssertion } from "../hooks/useSettleAssertion";
import { useReportResolution } from "../hooks/useReportResolution";
import { useDisputeAssertion } from "../hooks/useDisputeAssertion";

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

function shortenHash(hash: string): string {
  if (hash.length < 14) return hash;

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

// USDC bond formatting (6 decimals). Mirrors AssertOutcomeForm — kept inline to
// avoid coupling to that component's internals.
function formatBondUSDC(bond: bigint): string {
  return (Number(bond) / 1e6).toFixed(2);
}

function CopyableId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-default-500">{label}:</span>
      <Tooltip content={copied ? "Copied!" : "Click to copy"}>
        <button
          className="text-xs font-mono text-default-600 hover:text-foreground transition-colors"
          type="button"
          onClick={handleCopy}
        >
          {shortenHash(value)}
        </button>
      </Tooltip>
    </div>
  );
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
  const { disputeAssertion, isLoading: isDisputing } =
    useDisputeAssertion(marketId);

  const isDisputed = status?.assertionDetails?.isDisputed ?? false;
  const disputeBond = status?.assertionDetails?.bond;

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
          isDisputed={isDisputed}
          phase={status.phase}
          winningOutcome={status.resolution.winningOutcome}
        />

        {/* Assertion identifier — copyable for inspection on UMA Oracle */}
        {status.assertion.assertionId && (
          <div className="mt-4">
            <CopyableId
              label="Assertion ID"
              value={status.assertion.assertionId}
            />
          </div>
        )}

        {/* ACTIVE_NO_ASSERTION — show assert form */}
        {status.phase === "ACTIVE_NO_ASSERTION" && (
          <AssertOutcomeForm
            liveness={status.question.liveness}
            marketId={marketId}
            outcomes={outcomes}
            requiredBond={status.question.requiredBond}
          />
        )}

        {/* DISPUTED, DVM not yet resolved — escalation explainer */}
        {isDisputed &&
          status.phase === "ASSERTION_PENDING" &&
          status.assertionDetails && (
            <div className="flex flex-col gap-3 mt-4">
              <CopyableId
                label="Asserter"
                value={status.assertionDetails.asserter}
              />
              <CopyableId
                label="Disputer"
                value={status.assertionDetails.disputer}
              />
              <div className="rounded-lg border border-secondary-200 bg-secondary-50/40 p-3">
                <p className="text-sm text-secondary-700 font-medium mb-1">
                  Assertion disputed
                </p>
                <p className="text-xs text-default-600 leading-relaxed">
                  This assertion has been escalated to UMA&apos;s Data
                  Verification Mechanism (DVM). UMA tokenholders will vote on
                  the correct outcome and the result will be returned to the
                  Optimistic Oracle. Once the DVM resolves (typically ~48h),
                  anyone can settle the assertion to finalize this market.
                </p>
              </div>
            </div>
          )}

        {/* DISPUTED, DVM resolved — show settle button */}
        {isDisputed &&
          status.phase === "ASSERTION_EXPIRED" &&
          status.assertionDetails && (
            <div className="flex flex-col gap-3 mt-4">
              <CopyableId
                label="Asserter"
                value={status.assertionDetails.asserter}
              />
              <CopyableId
                label="Disputer"
                value={status.assertionDetails.disputer}
              />
              <div className="rounded-lg border border-secondary-200 bg-secondary-50/40 p-3">
                <p className="text-sm text-secondary-700 font-medium mb-1">
                  DVM resolved
                </p>
                <p className="text-xs text-default-600 leading-relaxed">
                  UMA&apos;s DVM has returned a price for this dispute. Anyone
                  can now settle the assertion to apply the DVM&apos;s outcome
                  and finalize this market.
                </p>
              </div>
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

        {/* ASSERTION_PENDING (undisputed) — countdown + details + dispute button */}
        {status.phase === "ASSERTION_PENDING" &&
          !isDisputed &&
          status.assertionDetails && (
            <div className="flex flex-col gap-3 mt-4">
              <CopyableId
                label="Asserter"
                value={status.assertionDetails.asserter}
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-default-500">
                  Challenge period ends:
                </span>
                <Chip color="primary" size="sm" variant="flat">
                  {formatCountdown(status.assertionDetails.expirationTime)}
                </Chip>
              </div>
              <p className="text-xs text-default-400">
                The assertion is in its challenge period. If unchallenged, it
                can be settled after expiration.
              </p>
              <Button
                className="w-full"
                color="primary"
                isDisabled={!isConnected || !status.assertion.assertionId}
                isLoading={isDisputing}
                variant="flat"
                onPress={() => {
                  if (status.assertion.assertionId) {
                    disputeAssertion(status.assertion.assertionId);
                  }
                }}
              >
                {!isConnected
                  ? "Connect Wallet"
                  : disputeBond
                    ? `Dispute Assertion (Bond: $${formatBondUSDC(disputeBond)})`
                    : "Dispute Assertion"}
              </Button>
              <p className="text-[11px] text-default-400 leading-relaxed">
                Disputing escalates to UMA&apos;s DVM. You must post a matching
                bond. If the DVM agrees with you, the asserter&apos;s bond is
                forfeited and you are reimbursed plus a share of the
                loser&apos;s bond.
              </p>
            </div>
          )}

        {/* ASSERTION_EXPIRED (undisputed) — show settle button */}
        {status.phase === "ASSERTION_EXPIRED" && !isDisputed && (
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
