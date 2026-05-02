"use client";

/**
 * Generic Transaction Hook
 *
 * Wraps any SDK write call: submit tx → wait for receipt → toast → invalidate cache.
 * Uses sonner for notifications and TanStack Query for cache invalidation.
 */

import type { Hash } from "viem";

import { useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTransactionOptions {
  /** Toast message shown while waiting for confirmation */
  pendingMessage?: string;
  /** Toast message shown on success */
  successMessage?: string;
  /** Toast message shown on error */
  errorMessage?: string;
  /** Query keys to invalidate on success */
  invalidateKeys?: readonly (readonly unknown[])[];
}

interface UseTransactionReturn {
  execute: (txFn: () => Promise<Hash>) => Promise<Hash | undefined>;
  isLoading: boolean;
  error: Error | null;
}

export function useTransaction(
  options: UseTransactionOptions = {},
): UseTransactionReturn {
  const {
    pendingMessage = "Transaction pending...",
    successMessage = "Transaction confirmed",
    errorMessage = "Transaction failed",
    invalidateKeys = [],
  } = options;

  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (txFn: () => Promise<Hash>): Promise<Hash | undefined> => {
      setIsLoading(true);
      setError(null);

      let toastId: string | number | undefined;

      try {
        toastId = toast.loading(pendingMessage);

        const hash = await txFn();

        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });

          if (receipt.status === "reverted") {
            throw new Error(`Transaction reverted (tx: ${hash})`);
          }
        }

        toast.success(successMessage, { id: toastId });

        // Invalidate related queries
        for (const key of invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key as unknown[] });
        }

        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        // Shorten the message for the toast
        const shortMessage =
          message.length > 100 ? message.slice(0, 100) + "..." : message;

        toast.error(`${errorMessage}: ${shortMessage}`, { id: toastId });
        setError(err instanceof Error ? err : new Error(message));

        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [
      publicClient,
      queryClient,
      pendingMessage,
      successMessage,
      errorMessage,
      invalidateKeys,
    ],
  );

  return { execute, isLoading, error };
}
