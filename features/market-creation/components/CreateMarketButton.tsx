"use client";

import { Button } from "@heroui/button";
import NextLink from "next/link";
import { useConnection } from "wagmi";

import { useCanCreateMarket } from "@/features/access-control";
import { getVenueId } from "@/config/venue.config";

export function CreateMarketButton() {
  const venueId = getVenueId();
  const { isConnected } = useConnection();
  const { data: canCreate } = useCanCreateMarket(venueId);

  if (!isConnected || !canCreate) return null;

  return (
    <Button
      as={NextLink}
      className="sm:h-10 sm:text-sm px-3 sm:px-4 min-w-0 font-semibold"
      color="primary"
      href="/create"
      size="sm"
    >
      Create Market
    </Button>
  );
}
