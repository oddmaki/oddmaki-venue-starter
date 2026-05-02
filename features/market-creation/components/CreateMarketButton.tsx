"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { useConnection } from "wagmi";

import { CreateMarketModal } from "./CreateMarketModal";

import { useCanCreateMarket } from "@/features/access-control";
import { getVenueId } from "@/config/venue.config";

export function CreateMarketButton() {
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
        color="primary"
        isDisabled={!canCreate}
        onPress={() => setIsOpen(true)}
      >
        {canCreate ? "Create Market" : "Creation Restricted"}
      </Button>
      <CreateMarketModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
