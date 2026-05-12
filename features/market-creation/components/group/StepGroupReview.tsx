"use client";

import type { GroupMarketFormData } from "../../types";

import { ApprovalBreakdown } from "../ApprovalBreakdown";
import { ReviewRow, ReviewSection } from "../WizardLayout";

import { fonts } from "@/lib/tokens";

interface StepGroupReviewProps {
  formData: GroupMarketFormData;
  creationFee: number;
  baseUmaReward: number;
}

export function StepGroupReview({
  formData,
  creationFee,
  baseUmaReward,
}: StepGroupReviewProps) {
  const validOutcomes = formData.outcomes.filter(
    (o) => o.name.trim() && o.question.trim(),
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ReviewSection title="Group">
        <ReviewRow label="Question" value={formData.title || "(not set)"} />
        <ReviewRow
          label="Resolution criteria"
          value={formData.description || "(not set)"}
        />
      </ReviewSection>

      <ReviewSection title={`Outcomes (${validOutcomes.length})`}>
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: 8,
          }}
        >
          {validOutcomes.map((o, i) => (
            <li
              key={i}
              style={{
                fontSize: 12,
                color: "#ddd",
                fontFamily: fonts.sans,
                paddingBottom: 8,
                borderBottom: "1px solid #ffffff06",
              }}
            >
              <div style={{ fontWeight: 600, color: "white" }}>
                {i + 1}. {o.name}
              </div>
              <div style={{ color: "#888", marginTop: 2 }}>{o.question}</div>
            </li>
          ))}
        </ul>
      </ReviewSection>

      <ReviewSection title="Trading & Oracle">
        <ReviewRow label="Tick size" value={`$${formData.tickSize}`} />
        <ReviewRow
          label="Additional UMA reward"
          value={`${formData.additionalReward} USDC`}
        />
        <ReviewRow
          label="Challenge period"
          value={
            formData.liveness === 0 ? "Default (2h)" : `${formData.liveness}s`
          }
        />
        <ReviewRow
          label="Placeholder markets"
          value={formData.placeholderCount.toString()}
        />
        <ReviewRow
          label="Activation"
          value={
            formData.activateImmediately
              ? "Activate immediately"
              : "Stay in Draft"
          }
        />
        <ReviewRow
          label="Tags"
          value={formData.tags.length ? formData.tags.join(", ") : "(none)"}
        />
      </ReviewSection>

      <ApprovalBreakdown
        additionalRewardUsdc={formData.additionalReward}
        baseUmaRewardUsdc={baseUmaReward}
        creationFeeUsdc={creationFee}
      />
    </div>
  );
}
