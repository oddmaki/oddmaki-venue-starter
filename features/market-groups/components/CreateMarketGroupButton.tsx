"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { useConnection } from "wagmi";

import { CreateMarketGroupModal } from "./CreateMarketGroupModal";

import { useCanCreateMarket } from "@/features/access-control";
import { getVenueId } from "@/config/venue.config";

export function CreateMarketGroupButton() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useConnection();
  const [isOpen, setIsOpen] = useState(false);
  const venueId = getVenueId();
  const { data: canCreate = true } = useCanCreateMarket(venueId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected) return null;

  return (
    <>
      <Button
        color="secondary"
        isDisabled={!canCreate}
        variant="bordered"
        onPress={() => setIsOpen(true)}
      >
        {canCreate ? "Create Group" : "Creation Restricted"}
      </Button>
      <CreateMarketGroupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
