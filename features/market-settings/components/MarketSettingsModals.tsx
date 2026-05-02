"use client";

import { TagsModal } from "./TagsModal";
import { TradingAccessModal } from "./TradingAccessModal";
import { PauseMarketModal } from "./PauseMarketModal";
import { MetadataModal } from "./MetadataModal";

export type SettingsAction = "tags" | "trading-access" | "pause" | "metadata";

interface MarketSettingsModalsProps {
  activeModal: SettingsAction | null;
  onClose: () => void;
  marketId: string;
}

export function MarketSettingsModals({
  activeModal,
  onClose,
  marketId,
}: MarketSettingsModalsProps) {
  return (
    <>
      <TagsModal
        isOpen={activeModal === "tags"}
        marketId={marketId}
        onClose={onClose}
      />
      <TradingAccessModal
        isOpen={activeModal === "trading-access"}
        marketId={marketId}
        onClose={onClose}
      />
      <PauseMarketModal
        isOpen={activeModal === "pause"}
        marketId={marketId}
        onClose={onClose}
      />
      <MetadataModal
        isOpen={activeModal === "metadata"}
        marketId={marketId}
        onClose={onClose}
      />
    </>
  );
}
