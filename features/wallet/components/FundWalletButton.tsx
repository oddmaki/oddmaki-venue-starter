"use client";

import { Button } from "@heroui/button";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com";

export function FundWalletButton() {
  return (
    <Button
      as="a"
      className="w-full"
      color="primary"
      href={CIRCLE_FAUCET_URL}
      rel="noopener noreferrer"
      size="sm"
      target="_blank"
      variant="flat"
    >
      Get testnet USDC
    </Button>
  );
}
