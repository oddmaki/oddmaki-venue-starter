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
import { useConnection } from "wagmi";

import { useSplitPosition } from "../hooks/useSplitPosition";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface SplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  outcomes: string[];
}

export function SplitModal({
  isOpen,
  onClose,
  marketId,
  outcomes,
}: SplitModalProps) {
  const { isConnected } = useConnection();
  const { startSplitPosition, flow } = useSplitPosition();
  const [amount, setAmount] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);

  const yesLabel = outcomes[0] || "Yes";
  const noLabel = outcomes[1] || "No";

  const isValid = (() => {
    const a = parseFloat(amount);

    return !isNaN(a) && a > 0;
  })();

  const handleSplit = async () => {
    if (!isValid) return;
    setFlowOpen(true);
    await startSplitPosition({ marketId, amount });
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
          <ModalHeader>Split shares</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500">
              Split a USDC into a share of {yesLabel} and {noLabel}. You can do
              this to save cost by getting both and just selling the other side.
            </p>
            <Input
              endContent={
                <span className="text-xs text-default-400">USDC</span>
              }
              label="Amount"
              min="0"
              placeholder="Enter amount"
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
              onPress={handleSplit}
            >
              {!isConnected ? "Connect Wallet" : "Split Shares"}
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
        title="Split Position"
        onClose={handleFlowClose}
        onRetry={flow.retry}
      />
    </>
  );
}
