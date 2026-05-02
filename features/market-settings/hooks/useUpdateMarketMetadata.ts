"use client";

import type { MarketMetadata } from "@oddmaki-protocol/sdk";

import { useOddMakiClient } from "@/lib/oddmaki/hooks";
import { useTransaction } from "@/lib/oddmaki/useTransaction";
import { queryKeys } from "@/lib/oddmaki/queryKeys";
import { uploadImageToIPFS, uploadToIPFS } from "@/lib/ipfs";

export function useUpdateMarketMetadata(marketId: string) {
  const client = useOddMakiClient();

  const { execute, isLoading, error } = useTransaction({
    pendingMessage: "Updating market metadata...",
    successMessage: "Market metadata updated!",
    errorMessage: "Failed to update metadata",
    invalidateKeys: [queryKeys.markets.detail(marketId)],
  });

  const updateMetadata = async (imageFile: File) => {
    // Upload image to IPFS
    const imageUri = await uploadImageToIPFS(imageFile);

    // Build and upload metadata JSON
    const metadata: MarketMetadata = {
      version: 1,
      image_url: imageUri,
    };
    const metadataUri = await uploadToIPFS(metadata);

    // Set on-chain metadata pointer
    return execute(() =>
      client.market.updateMarketMetadata({
        marketId: BigInt(marketId),
        metadataURI: metadataUri,
      }),
    );
  };

  return { updateMetadata, isLoading, error };
}
