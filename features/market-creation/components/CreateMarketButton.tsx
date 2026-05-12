"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useConnection } from "wagmi";

import { MarketCreationWizard } from "./MarketCreationWizard";

import { useCanCreateMarket } from "@/features/access-control";
import { getVenueId } from "@/config/venue.config";

export function CreateMarketButton() {
  const venueId = getVenueId();
  const { isConnected } = useConnection();
  const { data: canCreate } = useCanCreateMarket(venueId);
  const [isOpen, setIsOpen] = useState(false);

  if (!isConnected || !canCreate) return null;

  return (
    <>
      <Button
        className="sm:h-10 sm:text-sm px-2 sm:px-4 min-w-0"
        color="primary"
        size="sm"
        variant="flat"
        onPress={() => setIsOpen(true)}
      >
        <span className="sm:hidden">+</span>
        <span className="hidden sm:inline">+ Create</span>
      </Button>

      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        size="3xl"
        onClose={() => setIsOpen(false)}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-lg font-bold">Create market</h2>
          </ModalHeader>
          <ModalBody className="pb-6">
            <MarketCreationWizard onClose={() => setIsOpen(false)} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
