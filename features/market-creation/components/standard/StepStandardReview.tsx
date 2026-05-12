"use client";

import type { StandardMarketFormData } from "../../types";
import type { AccessControlType } from "@/features/access-control/hooks/useDeployAccessControl";

import { ApprovalBreakdown } from "../ApprovalBreakdown";
import { ReviewRow, ReviewSection } from "../WizardLayout";

interface StepStandardReviewProps {
  formData: StandardMarketFormData;
  creationFee: number;
  baseUmaReward: number;
}

const AC_LABELS: Record<AccessControlType, string> = {
  public: "Inherit venue default",
  whitelist: "Whitelist",
  "nft-erc721": "NFT (ERC-721)",
  "nft-erc1155": "NFT (ERC-1155)",
  token: "Token Gated",
  custom: "Custom Contract",
};

export function StepStandardReview({
  formData,
  creationFee,
  baseUmaReward,
}: StepStandardReviewProps) {
  const a =
    formData.outcomeMode === "binary"
      ? "Yes"
      : (formData.outcomes[0] ?? "").trim();
  const b =
    formData.outcomeMode === "binary"
      ? "No"
      : (formData.outcomes[1] ?? "").trim();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ReviewSection title="Question">
        <ReviewRow label="Title" value={formData.title || "(not set)"} />
        <ReviewRow
          label="Resolution criteria"
          value={formData.description || "(not set)"}
        />
      </ReviewSection>

      <ReviewSection title="Outcomes">
        <ReviewRow label="Outcome A" value={a || "(not set)"} />
        <ReviewRow label="Outcome B" value={b || "(not set)"} />
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
          label="Tags"
          value={formData.tags.length ? formData.tags.join(", ") : "(none)"}
        />
      </ReviewSection>

      <ReviewSection title="Trading access control">
        <ReviewRow label="Type" value={AC_LABELS[formData.tradingACType]} />
        {formData.tradingACType === "custom" && (
          <ReviewRow
            label="Contract"
            value={formData.tradingACCustomAddress || "(not set)"}
          />
        )}
        {(formData.tradingACType === "nft-erc721" ||
          formData.tradingACType === "nft-erc1155") && (
          <>
            <ReviewRow
              label="NFT contract"
              value={formData.tradingACNftContract || "(not set)"}
            />
            {formData.tradingACType === "nft-erc1155" && (
              <ReviewRow
                label="Token id"
                value={formData.tradingACNftTokenId || "(not set)"}
              />
            )}
          </>
        )}
        {formData.tradingACType === "token" && (
          <>
            <ReviewRow
              label="Token"
              value={formData.tradingACTokenContract || "(not set)"}
            />
            <ReviewRow
              label="Min balance"
              value={formData.tradingACTokenMinBalance || "(not set)"}
            />
          </>
        )}
      </ReviewSection>

      <ApprovalBreakdown
        additionalRewardUsdc={formData.additionalReward}
        baseUmaRewardUsdc={baseUmaReward}
        creationFeeUsdc={creationFee}
      />
    </div>
  );
}
