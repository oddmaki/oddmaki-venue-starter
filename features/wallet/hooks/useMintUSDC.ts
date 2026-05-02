"use client";

import { useCallback } from "react";
import { useConnection } from "wagmi";
import { parseUnits } from "viem";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { USDC_ADDRESS } from "@/lib/oddmaki/constants";

/**
 * Hook to mint mock USDC on testnet.
 * Mints 1000 USDC to the connected wallet.
 */
export function useMintUSDC() {
  const client = useOddMakiClient();
  const { address } = useConnection();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Minting 1,000 USDC...",
    successMessage: "1,000 USDC minted!",
    errorMessage: "Mint failed",
    invalidateKeys: address ? [queryKeys.balance.usdc(address)] : [],
  });

  const mint = useCallback(async () => {
    if (!address) return;
    await execute(() =>
      client.token.mint(USDC_ADDRESS, address, parseUnits("1000", 6)),
    );
  }, [address, client, execute]);

  return { mint, isMinting: isLoading, error };
}
