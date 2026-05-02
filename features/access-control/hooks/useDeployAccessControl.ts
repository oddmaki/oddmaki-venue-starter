"use client";

import { useCallback } from "react";
import { usePublicClient } from "wagmi";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";

export type AccessControlType =
  | "public"
  | "whitelist"
  | "nft-erc721"
  | "nft-erc1155"
  | "token"
  | "custom";

/**
 * Hook for deploying access control contracts via the Diamond factory.
 * Returns a function that deploys the AC contract and resolves to its address.
 */
export function useDeployAccessControl() {
  const client = useOddMakiClient();
  const publicClient = usePublicClient();

  const deployWhitelist = useCallback(async (): Promise<`0x${string}`> => {
    if (!publicClient) throw new Error("Public client not available");
    const hash = await client.accessControl.deployWhitelist();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    // The deployed contract address is in the AccessControlDeployed event log
    const log = receipt.logs.find(
      (l) =>
        l.topics[0] ===
        "0xf84d091c33e25edb2fa1abb290df9814b644f5f0c29e25546983ae2577276a41",
    );

    if (!log || !log.topics[2]) throw new Error("Deploy event not found");

    return ("0x" + log.topics[2].slice(26)) as `0x${string}`;
  }, [client, publicClient]);

  const deployNFTGated = useCallback(
    async (params: {
      nftContract: `0x${string}`;
      isERC1155: boolean;
      tokenId: bigint;
    }): Promise<`0x${string}`> => {
      if (!publicClient) throw new Error("Public client not available");
      const hash = await client.accessControl.deployNFTGated(params);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const log = receipt.logs.find(
        (l) =>
          l.topics[0] ===
          "0xf84d091c33e25edb2fa1abb290df9814b644f5f0c29e25546983ae2577276a41",
      );

      if (!log || !log.topics[2]) throw new Error("Deploy event not found");

      return ("0x" + log.topics[2].slice(26)) as `0x${string}`;
    },
    [client, publicClient],
  );

  const deployTokenGated = useCallback(
    async (params: {
      token: `0x${string}`;
      minBalance: bigint;
    }): Promise<`0x${string}`> => {
      if (!publicClient) throw new Error("Public client not available");
      const hash = await client.accessControl.deployTokenGated(params);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const log = receipt.logs.find(
        (l) =>
          l.topics[0] ===
          "0xf84d091c33e25edb2fa1abb290df9814b644f5f0c29e25546983ae2577276a41",
      );

      if (!log || !log.topics[2]) throw new Error("Deploy event not found");

      return ("0x" + log.topics[2].slice(26)) as `0x${string}`;
    },
    [client, publicClient],
  );

  return { deployWhitelist, deployNFTGated, deployTokenGated };
}
