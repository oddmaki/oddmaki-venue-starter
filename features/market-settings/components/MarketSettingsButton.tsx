"use client";

import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { useAccount } from "wagmi";

import {
  MarketSettingsModals,
  type SettingsAction,
} from "./MarketSettingsModals";

import { useVenueData } from "@/features/venue/hooks/useVenueData";
import { SettingsIcon } from "@/components/icons";

interface MarketSettingsButtonProps {
  marketId: string;
  marketCreator: string;
}

export function MarketSettingsButton({
  marketId,
  marketCreator,
}: MarketSettingsButtonProps) {
  const { address } = useAccount();
  const { isOperator } = useVenueData();
  const [activeModal, setActiveModal] = useState<SettingsAction | null>(null);

  const isCreator =
    !!address && marketCreator.toLowerCase() === address.toLowerCase();

  // Only show to operators or creators
  if (!isOperator && !isCreator) return null;

  // Build dropdown items based on role
  const operatorItems: { key: SettingsAction; label: string }[] = [];
  const creatorItems: { key: SettingsAction; label: string }[] = [];

  if (isOperator) {
    operatorItems.push(
      { key: "trading-access", label: "Trading Access" },
      { key: "pause", label: "Pause / Resume" },
    );
  }

  if (isCreator) {
    creatorItems.push(
      { key: "tags", label: "Tags" },
      { key: "metadata", label: "Market Image" },
    );
  }

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            isIconOnly
            aria-label="Market settings"
            size="sm"
            variant="light"
          >
            <SettingsIcon size={18} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Market settings"
          onAction={(key) => setActiveModal(key as SettingsAction)}
        >
          {operatorItems.length > 0 ? (
            <DropdownSection
              showDivider={creatorItems.length > 0}
              title="Operator"
            >
              {operatorItems.map((item) => (
                <DropdownItem key={item.key}>{item.label}</DropdownItem>
              ))}
            </DropdownSection>
          ) : (
            <></>
          )}
          {creatorItems.length > 0 ? (
            <DropdownSection title="Creator">
              {creatorItems.map((item) => (
                <DropdownItem key={item.key}>{item.label}</DropdownItem>
              ))}
            </DropdownSection>
          ) : (
            <></>
          )}
        </DropdownMenu>
      </Dropdown>

      <MarketSettingsModals
        activeModal={activeModal}
        marketId={marketId}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
