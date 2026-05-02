"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Button } from "@heroui/button";
import { useConnection } from "wagmi";

import { useTokenBalance } from "../hooks/useTokenBalance";

import { FundWalletButton } from "./FundWalletButton";

import { IS_TESTNET } from "@/lib/oddmaki/chain";

export function WalletPanel() {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useConnection();
  const { formatted, isLoading } = useTokenBalance();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isConnected) return null;

  const balanceLabel = isLoading ? (
    "..."
  ) : (
    <>
      <span className="sm:hidden">${formatted}</span>
      <span className="hidden sm:inline">${formatted} USDC</span>
    </>
  );

  // On production chains there's nothing actionable behind the popover —
  // skip it and render the balance as a plain, non-interactive display.
  if (!IS_TESTNET) {
    return (
      <Button
        disableRipple
        className="sm:h-10 sm:text-sm px-2 sm:px-4 min-w-0 pointer-events-none"
        size="sm"
        variant="flat"
      >
        {balanceLabel}
      </Button>
    );
  }

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          className="sm:h-10 sm:text-sm px-2 sm:px-4 min-w-0"
          size="sm"
          variant="flat"
        >
          {balanceLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="flex flex-col gap-4 p-3">
          {/* Balance */}
          <div>
            <p className="text-xs text-default-500 font-semibold uppercase tracking-wider">
              USDC Balance
            </p>
            <p className="text-2xl font-bold mt-1">${formatted}</p>
          </div>

          {/* Mint (testnet) */}
          <FundWalletButton />
        </div>
      </PopoverContent>
    </Popover>
  );
}
