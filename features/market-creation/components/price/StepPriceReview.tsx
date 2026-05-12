"use client";

import type { PriceMarketFormData } from "../../types";

import { ApprovalBreakdown } from "../ApprovalBreakdown";
import { ReviewRow, ReviewSection } from "../WizardLayout";

interface StepPriceReviewProps {
  formData: PriceMarketFormData;
  resolvedTitle: string;
  resolvedDescription: string;
  closeDisplay: string | null;
  outcomes: [string, string];
  creationFee: number;
  baseUmaReward: number;
}

function shortenFeed(id: string): string {
  if (id.length <= 14) return id;

  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}

export function StepPriceReview({
  formData,
  resolvedTitle,
  resolvedDescription,
  closeDisplay,
  outcomes,
  creationFee,
  baseUmaReward,
}: StepPriceReviewProps) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ReviewSection title="Question">
        <ReviewRow label="Title" value={resolvedTitle || "(not set)"} />
        <ReviewRow
          label="Description"
          value={resolvedDescription || "(none)"}
        />
      </ReviewSection>

      <ReviewSection title="Pyth Feed">
        <ReviewRow label="Symbol" value={formData.feedSymbol || "(custom)"} />
        <ReviewRow label="Feed ID" value={shortenFeed(formData.pythFeedId)} />
        <ReviewRow
          label="Mode"
          value={formData.useStrikePrice ? "Strike (Above/Below)" : "Up/Down"}
        />
        {formData.useStrikePrice && (
          <ReviewRow label="Strike price" value={`$${formData.strikePrice}`} />
        )}
      </ReviewSection>

      <ReviewSection title="Trading & Schedule">
        <ReviewRow label="Outcomes" value={`${outcomes[0]} / ${outcomes[1]}`} />
        <ReviewRow label="Close time" value={closeDisplay || "(not set)"} />
        <ReviewRow label="Tick size" value={`$${formData.tickSize}`} />
        <ReviewRow
          label="Resolution window"
          value={
            formData.resolutionWindow === 0
              ? "Default (60s)"
              : `${formData.resolutionWindow}s`
          }
        />
        <ReviewRow
          label="Fallback challenge period"
          value={
            formData.liveness === 0 ? "Default (2h)" : `${formData.liveness}s`
          }
        />
        <ReviewRow
          label="Tags"
          value={formData.tags.length ? formData.tags.join(", ") : "(none)"}
        />
      </ReviewSection>

      <ApprovalBreakdown
        isPriceMarket
        additionalRewardUsdc={0}
        baseUmaRewardUsdc={baseUmaReward}
        creationFeeUsdc={creationFee}
      />
    </div>
  );
}
