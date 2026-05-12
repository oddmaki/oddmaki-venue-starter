"use client";

import { colors, fonts } from "@/lib/tokens";

interface ApprovalBreakdownProps {
  creationFeeUsdc: number;
  baseUmaRewardUsdc: number;
  additionalRewardUsdc: number;
  /** Whether the approval is for a price market (UMA is fallback only). */
  isPriceMarket?: boolean;
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ApprovalBreakdown({
  creationFeeUsdc,
  baseUmaRewardUsdc,
  additionalRewardUsdc,
  isPriceMarket = false,
}: ApprovalBreakdownProps) {
  const total = isPriceMarket
    ? creationFeeUsdc
    : creationFeeUsdc + baseUmaRewardUsdc + additionalRewardUsdc;

  if (total <= 0) {
    return (
      <div
        style={{
          padding: 14,
          background: "#181818",
          borderRadius: 10,
          border: "1px solid #ffffff0a",
          fontSize: 12,
          color: "#9a9a9a",
          fontFamily: fonts.sans,
          lineHeight: 1.55,
        }}
      >
        {isPriceMarket
          ? "No USDC approval required — this venue has zero market-creation fee."
          : "No USDC approval required — this venue has zero market-creation fee and zero UMA reward."}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        background: "#181818",
        borderRadius: 10,
        border: "1px solid #ffffff0a",
        fontFamily: fonts.sans,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: colors.neonCyan,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          USDC approval needed
        </span>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "white",
            fontFamily: fonts.mono,
          }}
        >
          {formatUsd(total)}
        </span>
      </div>

      <div style={{ display: "grid", gap: 4 }}>
        <Row
          hint="Set by the venue operator on-chain. Split protocol/venue."
          label="Market creation fee (venue)"
          value={formatUsd(creationFeeUsdc)}
        />
        {!isPriceMarket && (
          <Row
            hint="Default reward this venue pays UMA asserters. Read from venue config on-chain."
            label="Base UMA reward (venue)"
            value={formatUsd(baseUmaRewardUsdc)}
          />
        )}
        {!isPriceMarket && additionalRewardUsdc > 0 && (
          <Row
            hint="Optional boost you set on the previous step."
            label="Additional UMA reward (this market)"
            value={formatUsd(additionalRewardUsdc)}
          />
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid #ffffff06",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: "#ddd",
            fontWeight: 500,
            fontFamily: fonts.sans,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#888",
            marginTop: 2,
            lineHeight: 1.5,
            fontFamily: fonts.sans,
          }}
        >
          {hint}
        </div>
      </div>
      <span
        style={{
          fontSize: 13,
          color: "white",
          fontWeight: 600,
          fontFamily: fonts.mono,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}
