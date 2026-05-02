"use client";

/**
 * Multi-Step Transaction Flow Hook
 *
 * Manages sequential execution of transaction steps (approvals + main tx).
 * Each step can optionally be skipped (e.g. when allowance is sufficient).
 * Supports retry from the failed step.
 */

import type { Address, PublicClient } from "viem";

import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi } from "viem";

export type StepStatus = "pending" | "active" | "completed" | "error";

/**
 * Poll until ERC20 allowance meets the required amount.
 * RPC nodes may return stale state right after an approval tx confirms.
 * This ensures the next step won't hit a pre-flight check failure.
 */
export async function waitForAllowance(
  publicClient: PublicClient,
  token: Address,
  owner: Address,
  spender: Address,
  requiredAmount: bigint,
  maxAttempts = 10,
  intervalMs = 1000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const allowance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
    });

    if (allowance >= requiredAmount) return;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

export interface FlowStep {
  id: string;
  label: string;
  /** Execute the step (send tx, wait for receipt, etc.) */
  execute: () => Promise<void>;
  /** Return true to skip this step (e.g. allowance already sufficient) */
  shouldSkip?: () => Promise<boolean>;
}

export interface FlowStepState {
  id: string;
  label: string;
  status: StepStatus;
  error?: string;
}

interface UseTransactionFlowOptions {
  /** Query keys to invalidate on successful completion of all steps */
  invalidateKeys?: readonly (readonly unknown[])[];
  /** Called when all steps complete successfully */
  onSuccess?: () => void;
}

export function useTransactionFlow(options: UseTransactionFlowOptions = {}) {
  const [stepStates, setStepStates] = useState<FlowStepState[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const stepsRef = useRef<FlowStep[]>([]);
  const failedIndexRef = useRef<number>(-1);
  const queryClient = useQueryClient();

  const updateStep = useCallback(
    (index: number, updates: Partial<FlowStepState>) => {
      setStepStates((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...updates } : s)),
      );
    },
    [],
  );

  const runFromIndex = useCallback(
    async (startIndex: number) => {
      setIsRunning(true);
      const steps = stepsRef.current;

      for (let i = startIndex; i < steps.length; i++) {
        const step = steps[i];

        // Check if step can be skipped
        if (step.shouldSkip) {
          try {
            const skip = await step.shouldSkip();

            if (skip) {
              updateStep(i, { status: "completed" });
              continue;
            }
          } catch {
            // If skip-check fails, proceed with execution
          }
        }

        updateStep(i, { status: "active", error: undefined });

        try {
          await step.execute();
          updateStep(i, { status: "completed" });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";

          updateStep(i, { status: "error", error: message });
          failedIndexRef.current = i;
          setIsRunning(false);

          return;
        }
      }

      // All steps completed successfully
      setIsRunning(false);

      for (const key of options.invalidateKeys ?? []) {
        queryClient.invalidateQueries({ queryKey: key as unknown[] });
      }

      options.onSuccess?.();
    },
    [options, queryClient, updateStep],
  );

  const start = useCallback(
    async (steps: FlowStep[]) => {
      stepsRef.current = steps;
      failedIndexRef.current = -1;
      setStepStates(
        steps.map((s) => ({
          id: s.id,
          label: s.label,
          status: "pending" as StepStatus,
        })),
      );
      // Small delay to let React render the initial pending states
      await new Promise((resolve) => setTimeout(resolve, 0));
      await runFromIndex(0);
    },
    [runFromIndex],
  );

  const retry = useCallback(async () => {
    if (failedIndexRef.current >= 0) {
      await runFromIndex(failedIndexRef.current);
    }
  }, [runFromIndex]);

  const reset = useCallback(() => {
    setStepStates([]);
    stepsRef.current = [];
    failedIndexRef.current = -1;
    setIsRunning(false);
  }, []);

  const isComplete =
    stepStates.length > 0 && stepStates.every((s) => s.status === "completed");
  const hasError = stepStates.some((s) => s.status === "error");

  return { stepStates, start, retry, reset, isRunning, isComplete, hasError };
}
