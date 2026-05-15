"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useAccount } from "wagmi";

import { useMergePositions } from "../hooks/useMergePositions";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  outcomes: string[];
}

export function MergeModal({
  isOpen,
  onClose,
  marketId,
  outcomes,
}: MergeModalProps) {
  const { isConnected } = useAccount();
  const { startMergePositions, flow } = useMergePositions();
  const [amount, setAmount] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);

  const yesLabel = outcomes[0] || "Yes";
  const noLabel = outcomes[1] || "No";

  const isValid = (() => {
    const a = parseFloat(amount);

    return !isNaN(a) && a > 0;
  })();

  const handleMerge = async () => {
    if (!isValid) return;
    setFlowOpen(true);
    await startMergePositions({ marketId, amount });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      setAmount("");
      onClose();
    }
    setFlowOpen(false);
    flow.reset();
  };

  const handleClose = () => {
    setAmount("");
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen && !flowOpen} size="sm" onClose={handleClose}>
        <ModalContent>
          <ModalHeader>Merge shares</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              Merge a share of {yesLabel} and {noLabel} to get 1 USDC. You can
              do this to save cost when trying to get rid of a position.
            </p>
            <Input
              endContent={
                <span className="text-xs text-default-400">each</span>
              }
              label="Amount"
              min="0"
              placeholder="Tokens to merge (each side)"
              size="sm"
              step="1"
              type="number"
              value={amount}
              onValueChange={setAmount}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-full"
              color="primary"
              isDisabled={!isConnected || !isValid}
              onPress={handleMerge}
            >
              {!isConnected ? "Connect Wallet" : "Merge Shares"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TransactionFlowModal
        hasError={flow.hasError}
        isComplete={flow.isComplete}
        isOpen={flowOpen}
        isRunning={flow.isRunning}
        stepStates={flow.stepStates}
        title="Merge Positions"
        onClose={handleFlowClose}
        onRetry={flow.retry}
      />
    </>
  );
}
