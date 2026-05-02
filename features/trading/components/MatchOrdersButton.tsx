"use client";

import type { MatchPreview } from "../hooks/useCanMatchOrders";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { useConnection } from "wagmi";

import { useMatchOrders } from "../hooks/useMatchOrders";
import { useCanMatchOrders } from "../hooks/useCanMatchOrders";

import { TransactionFlowModal } from "@/lib/oddmaki/TransactionFlowModal";

interface MatchOrdersButtonProps {
  marketId: string;
  tickSize: string;
}

function tickToPrice(tick: bigint, tickSize: string): string {
  if (tick === BigInt(0)) return "--";
  const price = Number(tick * BigInt(tickSize)) / 1e18;

  return `$${price.toFixed(2)}`;
}

function MatchPreviewDetails({
  preview,
  tickSize,
}: {
  preview: MatchPreview;
  tickSize: string;
}) {
  const paths = [
    { label: "Normal YES", active: preview.normalYesCross },
    { label: "Normal NO", active: preview.normalNoCross },
    { label: "Mint-to-Fill", active: preview.mintFeasible },
    { label: "Merge-to-Fill", active: preview.mergeFeasible },
  ];

  const expiryFlags = [
    { label: "YES Bid Head", expired: preview.yesBidHeadExpired },
    { label: "YES Ask Head", expired: preview.yesAskHeadExpired },
    { label: "NO Bid Head", expired: preview.noBidHeadExpired },
    { label: "NO Ask Head", expired: preview.noAskHeadExpired },
  ].filter((f) => f.expired);

  return (
    <div className="flex flex-col gap-3">
      {/* Fill paths */}
      <div>
        <p className="text-xs text-default-400 uppercase mb-1.5">Fill Paths</p>
        <div className="flex flex-wrap gap-1.5">
          {paths.map((p) => (
            <Chip
              key={p.label}
              color={p.active ? "success" : "default"}
              size="sm"
              variant={p.active ? "flat" : "bordered"}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Top of book snapshot */}
      <div>
        <p className="text-xs text-default-400 uppercase mb-1.5">Top of Book</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-default-500">YES Bid</span>
            <span className="font-mono">
              {tickToPrice(preview.yesBestBid, tickSize)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-default-500">YES Ask</span>
            <span className="font-mono">
              {tickToPrice(preview.yesBestAsk, tickSize)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-default-500">NO Bid</span>
            <span className="font-mono">
              {tickToPrice(preview.noBestBid, tickSize)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-default-500">NO Ask</span>
            <span className="font-mono">
              {tickToPrice(preview.noBestAsk, tickSize)}
            </span>
          </div>
        </div>
      </div>

      {/* Expiry warnings */}
      {expiryFlags.length > 0 && (
        <div>
          <p className="text-xs text-warning uppercase mb-1.5">
            Expired Head Orders
          </p>
          <div className="flex flex-wrap gap-1.5">
            {expiryFlags.map((f) => (
              <Chip key={f.label} color="warning" size="sm" variant="flat">
                {f.label}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchOrdersButton({
  marketId,
  tickSize,
}: MatchOrdersButtonProps) {
  const { isConnected } = useConnection();
  const { startMatchOrders, flow } = useMatchOrders();
  const { data: preview } = useCanMatchOrders(marketId);
  const [maxSteps, setMaxSteps] = useState("10");
  const [modalOpen, setModalOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);

  const anyMatchable = preview?.anyMatchable ?? false;

  const handleMatch = async () => {
    setFlowOpen(true);
    await startMatchOrders({
      marketId,
      maxSteps: parseInt(maxSteps) || 10,
    });
  };

  const handleFlowClose = () => {
    if (flow.isComplete) {
      setModalOpen(false);
    }
    setFlowOpen(false);
    flow.reset();
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Button
        className="w-full"
        color={anyMatchable ? "primary" : "secondary"}
        isDisabled={!isConnected}
        variant={anyMatchable ? "solid" : "flat"}
        onPress={() => setModalOpen(true)}
      >
        {!isConnected ? (
          "Connect Wallet"
        ) : anyMatchable ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Matching Available
          </span>
        ) : (
          "Match Orders"
        )}
      </Button>

      <Modal isOpen={modalOpen && !flowOpen} size="sm" onClose={handleClose}>
        <ModalContent>
          <ModalHeader>Match Orders</ModalHeader>
          <ModalBody>
            {preview && (
              <MatchPreviewDetails preview={preview} tickSize={tickSize} />
            )}

            {!anyMatchable && preview && (
              <p className="text-xs text-default-400">
                No matching opportunities detected right now. You can still
                attempt matching — the on-chain engine will find any that appear
                by execution time.
              </p>
            )}

            <p className="text-sm text-default-500">
              Anyone can trigger order matching to earn the operator fee. Set
              the maximum number of iteration steps for the matching engine.
            </p>
            <Input
              label="Max iteration steps"
              max={100}
              min={1}
              size="sm"
              type="number"
              value={maxSteps}
              onValueChange={setMaxSteps}
            />
          </ModalBody>
          <ModalFooter>
            <Button className="w-full" color="primary" onPress={handleMatch}>
              Match Orders
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
        title="Match Orders"
        onClose={handleFlowClose}
        onRetry={flow.retry}
      />
    </>
  );
}
