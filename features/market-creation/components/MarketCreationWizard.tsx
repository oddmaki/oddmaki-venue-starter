"use client";

import type { MarketType } from "../types";

import { useState } from "react";
import { useAccount } from "wagmi";

import { GroupMarketWizard } from "./group/GroupMarketWizard";
import { MarketTypeSelector } from "./MarketTypeSelector";
import { PriceMarketWizard } from "./price/PriceMarketWizard";
import { StandardMarketWizard } from "./standard/StandardMarketWizard";

import { useVenueData } from "@/features/venue/hooks/useVenueData";
import { getVenueId } from "@/config/venue.config";
import { USDC_DECIMALS } from "@/lib/oddmaki/constants";
import { colors, fonts } from "@/lib/tokens";

interface MarketCreationWizardProps {
  onClose?: () => void;
}

const ZERO = "0x0000000000000000000000000000000000000000";

export function MarketCreationWizard({ onClose }: MarketCreationWizardProps) {
  const venueId = getVenueId();
  const { isConnected, address } = useAccount();
  const { venue, isLoading: venueLoading } = useVenueData();
  const [marketType, setMarketType] = useState<MarketType | null>(null);

  if (venueId === undefined) {
    return (
      <div
        style={{
          padding: "clamp(24px, 5vw, 40px)",
          textAlign: "center",
          border: "1px dashed #ffffff12",
          borderRadius: 12,
          color: "#aaa",
          fontSize: 14,
          fontFamily: fonts.sans,
        }}
      >
        No venue is configured. Set NEXT_PUBLIC_VENUE_ID and restart.
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div
        style={{
          padding: "clamp(24px, 5vw, 40px)",
          textAlign: "center",
          border: "1px dashed #ffffff12",
          borderRadius: 12,
          color: "#666",
          fontSize: 14,
          fontFamily: fonts.sans,
        }}
      >
        Connect your wallet to create a market.
      </div>
    );
  }

  if (venueLoading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#888",
          fontSize: 14,
          fontFamily: fonts.sans,
        }}
      >
        Loading venue…
      </div>
    );
  }

  if (!venue) {
    return (
      <div
        style={{
          padding: "clamp(24px, 5vw, 40px)",
          textAlign: "center",
          border: "1px dashed #ffffff12",
          borderRadius: 12,
          color: "#aaa",
          fontSize: 14,
          fontFamily: fonts.sans,
        }}
      >
        Could not load venue {venueId.toString()}.
      </div>
    );
  }

  const venueTradingAC = String(venue.tradingAccessControl ?? ZERO);
  const baseUmaReward =
    Number(venue.umaRewardAmount ?? BigInt(0)) / 10 ** USDC_DECIMALS;
  const creationFee =
    Number(venue.marketCreationFee ?? BigInt(0)) / 10 ** USDC_DECIMALS;

  if (!marketType) {
    return <MarketTypeSelector selected={null} onSelect={setMarketType} />;
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <button
        style={{
          alignSelf: "flex-start",
          padding: "6px 10px",
          background: "transparent",
          border: "1px solid #ffffff14",
          borderRadius: 8,
          color: "#bbb",
          fontSize: 12,
          cursor: "pointer",
          fontFamily: fonts.sans,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
        type="button"
        onClick={() => setMarketType(null)}
      >
        <svg fill="none" height="10" viewBox="0 0 16 16" width="10">
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        Change market type ·{" "}
        <span style={{ color: colors.neonCyan, fontWeight: 600 }}>
          {marketType === "standard"
            ? "Binary Market"
            : marketType === "group"
              ? "Market Group"
              : "Price Market"}
        </span>
      </button>

      {marketType === "standard" && (
        <StandardMarketWizard
          baseUmaReward={baseUmaReward}
          creationFee={creationFee}
          venueId={venueId}
          venueTradingAC={venueTradingAC}
          onChangeType={() => setMarketType(null)}
          onClose={onClose}
        />
      )}
      {marketType === "group" && (
        <GroupMarketWizard
          baseUmaReward={baseUmaReward}
          creationFee={creationFee}
          venueId={venueId}
          onChangeType={() => setMarketType(null)}
          onClose={onClose}
        />
      )}
      {marketType === "price" && (
        <PriceMarketWizard
          creationFee={creationFee}
          venueId={venueId}
          onChangeType={() => setMarketType(null)}
          onClose={onClose}
        />
      )}
    </div>
  );
}
