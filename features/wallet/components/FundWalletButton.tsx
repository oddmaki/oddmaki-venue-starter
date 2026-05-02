"use client";

import { Button } from "@heroui/button";

import { useMintUSDC } from "../hooks/useMintUSDC";

export function FundWalletButton() {
  const { mint, isMinting } = useMintUSDC();

  return (
    <Button
      className="w-full"
      color="primary"
      isLoading={isMinting}
      size="sm"
      variant="flat"
      onPress={mint}
    >
      {isMinting ? "Minting..." : "Mint 1,000 USDC"}
    </Button>
  );
}
