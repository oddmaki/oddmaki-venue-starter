"use client";

import type { StandardMarketFormData } from "../../types";
import type { AccessControlType } from "@/features/access-control/hooks/useDeployAccessControl";

import { Field, inputStyle, monoInputStyle } from "../Field";
import { InfoCallout } from "../WizardLayout";

import { colors, fonts } from "@/lib/tokens";

interface StepStandardAccessControlProps {
  formData: StandardMarketFormData;
  updateField: <K extends keyof StandardMarketFormData>(
    key: K,
    value: StandardMarketFormData[K],
  ) => void;
  venueTradingAC: string | null;
}

const AC_OPTIONS: {
  value: AccessControlType;
  label: string;
  description: string;
}[] = [
  {
    value: "public",
    label: "Inherit venue",
    description: "Use the venue’s trading access control.",
  },
  {
    value: "whitelist",
    label: "Whitelist",
    description: "Only approved addresses.",
  },
  {
    value: "nft-erc721",
    label: "NFT (ERC-721)",
    description: "Holders of an ERC-721 NFT.",
  },
  {
    value: "nft-erc1155",
    label: "NFT (ERC-1155)",
    description: "Holders of a specific token id.",
  },
  {
    value: "token",
    label: "Token Gated",
    description: "Minimum token balance.",
  },
  {
    value: "custom",
    label: "Custom Contract",
    description: "Your own AC contract.",
  },
];

const ZERO = "0x0000000000000000000000000000000000000000";

function formatVenueAC(addr: string | null): string {
  if (!addr || addr === ZERO) return "Public (no restrictions)";

  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function StepStandardAccessControl({
  formData,
  updateField,
  venueTradingAC,
}: StepStandardAccessControlProps) {
  const acType = formData.tradingACType;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <InfoCallout>
        Markets inherit the venue’s trading access control by default. Override
        it here if this market needs different rules. Venue default:{" "}
        <span style={{ color: "white", fontWeight: 600 }}>
          {formatVenueAC(venueTradingAC)}
        </span>
        .
      </InfoCallout>

      <div
        style={{
          padding: 20,
          background: "#181818",
          borderRadius: 12,
          border: "1px solid #ffffff0a",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: colors.neonCyan,
            fontWeight: 600,
            marginBottom: 16,
            fontFamily: fonts.sans,
          }}
        >
          Market Trading Access Control
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap: 8,
            marginBottom: 16,
          }}
        >
          {AC_OPTIONS.map((opt) => {
            const selected = acType === opt.value;

            return (
              <button
                key={opt.value}
                style={{
                  padding: "10px 12px",
                  background: selected ? `${colors.neonCyan}14` : "transparent",
                  border: `1px solid ${selected ? `${colors.neonCyan}66` : "#ffffff14"}`,
                  borderRadius: 8,
                  color: selected ? "white" : "#bbb",
                  fontSize: 12,
                  fontFamily: fonts.sans,
                  cursor: "pointer",
                  textAlign: "left",
                }}
                type="button"
                onClick={() => updateField("tradingACType", opt.value)}
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div
                  style={{ fontSize: 10, color: selected ? "#ddd" : "#9a9a9a" }}
                >
                  {opt.description}
                </div>
              </button>
            );
          })}
        </div>

        {(acType === "nft-erc721" || acType === "nft-erc1155") && (
          <div style={{ display: "grid", gap: 12 }}>
            <Field required label="NFT Contract Address">
              <input
                placeholder="0x…"
                style={monoInputStyle}
                type="text"
                value={formData.tradingACNftContract}
                onChange={(e) =>
                  updateField("tradingACNftContract", e.target.value)
                }
              />
            </Field>
            {acType === "nft-erc1155" && (
              <Field required label="Token ID">
                <input
                  placeholder="0"
                  style={monoInputStyle}
                  type="text"
                  value={formData.tradingACNftTokenId}
                  onChange={(e) =>
                    updateField("tradingACNftTokenId", e.target.value)
                  }
                />
              </Field>
            )}
          </div>
        )}

        {acType === "token" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: 12,
            }}
          >
            <Field required label="Token Contract Address">
              <input
                placeholder="0x…"
                style={monoInputStyle}
                type="text"
                value={formData.tradingACTokenContract}
                onChange={(e) =>
                  updateField("tradingACTokenContract", e.target.value)
                }
              />
            </Field>
            <Field required label="Min Balance">
              <input
                placeholder="100"
                style={inputStyle}
                type="text"
                value={formData.tradingACTokenMinBalance}
                onChange={(e) =>
                  updateField("tradingACTokenMinBalance", e.target.value)
                }
              />
            </Field>
          </div>
        )}

        {acType === "custom" && (
          <Field required label="Custom AC Contract Address">
            <input
              placeholder="0x…"
              style={monoInputStyle}
              type="text"
              value={formData.tradingACCustomAddress}
              onChange={(e) =>
                updateField("tradingACCustomAddress", e.target.value)
              }
            />
          </Field>
        )}
      </div>
    </div>
  );
}
