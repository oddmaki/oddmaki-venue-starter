"use client";

import { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { useConnection } from "wagmi";

import { CreateMarketModal } from "./CreateMarketModal";

import { CreateMarketGroupModal } from "@/features/market-groups/components/CreateMarketGroupModal";
import { CreatePriceMarketModal } from "@/features/price-market";
import { useCanCreateMarket } from "@/features/access-control";
import { getVenueId } from "@/config/venue.config";

type ModalType = "binary" | "multi-outcome" | "price" | null;

export function CreateMarketDropdown() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useConnection();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const venueId = getVenueId();
  const { data: canCreate = true } = useCanCreateMarket(venueId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected || !canCreate || !venueId) return null;

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            className="hover:text-primary transition-colors"
            size="md"
            variant="flat"
          >
            New Market
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Create market type"
          onAction={(key) => setActiveModal(key as ModalType)}
        >
          <DropdownItem key="binary" description="Simple yes/no question">
            Binary Market
          </DropdownItem>
          <DropdownItem
            key="multi-outcome"
            description="Multiple mutually exclusive outcomes"
          >
            Multi-Outcome Market
          </DropdownItem>
          <DropdownItem
            key="price"
            description="Oracle-powered price prediction"
          >
            Price Market
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <CreateMarketModal
        isOpen={activeModal === "binary"}
        onClose={() => setActiveModal(null)}
      />
      <CreateMarketGroupModal
        isOpen={activeModal === "multi-outcome"}
        onClose={() => setActiveModal(null)}
      />
      <CreatePriceMarketModal
        isOpen={activeModal === "price"}
        venueId={venueId}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
