"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { MarketCreationWizard } from "@/features/market-creation";
import { colors, fonts } from "@/lib/tokens";

export default function CreateMarketPage() {
  const router = useRouter();

  const handleClose = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <section className="flex flex-1 flex-col gap-4 pt-4 pb-10 md:pt-6 md:pb-12">
      <button
        style={{
          alignSelf: "flex-start",
          padding: "8px 14px",
          background: "transparent",
          border: "1px solid #ffffff14",
          borderRadius: 8,
          color: "#bbb",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: fonts.sans,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
        type="button"
        onClick={handleClose}
      >
        <svg fill="none" height="12" viewBox="0 0 16 16" width="12">
          <path
            d="M10 3L5 8L10 13"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
        Cancel
      </button>

      <div style={{ display: "grid", gap: 16 }}>
        <header style={{ display: "grid", gap: 6 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              margin: 0,
              fontFamily: fonts.sans,
              letterSpacing: "-0.02em",
            }}
          >
            Create market
          </h1>
          <p
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              margin: 0,
              fontFamily: fonts.sans,
              lineHeight: 1.5,
            }}
          >
            Pick a market type, configure it, and publish on-chain.
          </p>
        </header>

        <MarketCreationWizard onClose={handleClose} />
      </div>
    </section>
  );
}
