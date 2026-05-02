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

import { useVenueData } from "../hooks/useVenueData";

import { VenueModalsContainer, type SectionKey } from "./VenueModals";

export function VenueManagementButton() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useConnection();
  const { venue, isOperator, isLoading } = useVenueData();
  const [activeModal, setActiveModal] = useState<SectionKey | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected || isLoading || !isOperator || !venue) {
    return null;
  }

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button size="md" variant="flat">
            Manage Venue
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Venue management"
          className="text-right"
          onAction={(key) => setActiveModal(key as SectionKey)}
        >
          <DropdownItem key="general" className="text-right">
            General
          </DropdownItem>
          <DropdownItem key="branding" className="text-right">
            Branding
          </DropdownItem>
          <DropdownItem key="access-control" className="text-right">
            Access Control
          </DropdownItem>
          <DropdownItem key="fees" className="text-right">
            Fees
          </DropdownItem>
          <DropdownItem key="oracle" className="text-right">
            Oracle
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <VenueModalsContainer
        activeModal={activeModal}
        venue={venue}
        onClose={closeModal}
        onManageWhitelist={(key) => setActiveModal(key)}
      />
    </>
  );
}
