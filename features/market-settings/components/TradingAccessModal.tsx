"use client";

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
import { Divider } from "@heroui/divider";
import { isAddress } from "viem";

import { useSetMarketTradingAC } from "../hooks/useSetMarketTradingAC";

import { useVenueData } from "@/features/venue/hooks/useVenueData";
import {
  useMarketTradingAC,
  useWhitelistOwner,
  WhitelistManagementModal,
} from "@/features/access-control";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface TradingAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
}

export function TradingAccessModal({
  isOpen,
  onClose,
  marketId,
}: TradingAccessModalProps) {
  const { venue } = useVenueData();
  const { data: marketAC } = useMarketTradingAC(BigInt(marketId));
  const { setMarketTradingAC, removeMarketTradingAC, isLoading } =
    useSetMarketTradingAC(marketId);
  const [acInput, setAcInput] = useState("");
  const [whitelistOpen, setWhitelistOpen] = useState(false);

  // Determine effective AC
  const hasMarketOverride = !!marketAC && marketAC !== ZERO_ADDRESS;
  const effectiveAC = hasMarketOverride
    ? marketAC
    : venue?.tradingAccessControl;
  const isPublic = !effectiveAC || effectiveAC === ZERO_ADDRESS;

  // Check if effective AC is a whitelist
  const { data: owner, error: ownerError } = useWhitelistOwner(
    isPublic ? undefined : (effectiveAC as `0x${string}`),
  );
  const isWhitelist = !isPublic && !!owner && !ownerError;

  const handleSetAC = async () => {
    if (!isAddress(acInput)) return;
    const hash = await setMarketTradingAC(acInput as `0x${string}`);

    if (hash) setAcInput("");
  };

  const handleRemoveOverride = async () => {
    const hash = await removeMarketTradingAC();

    if (hash) setAcInput("");
  };

  return (
    <>
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <ModalHeader>Trading Access Control</ModalHeader>
          <ModalBody>
            {/* Current status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-default-500">Current Status</span>
              {isPublic ? (
                <Chip color="primary" size="sm" variant="flat">
                  Public
                </Chip>
              ) : (
                <div className="flex items-center gap-2">
                  <Chip
                    color={hasMarketOverride ? "secondary" : "default"}
                    size="sm"
                    variant="flat"
                  >
                    {hasMarketOverride ? "Market Override" : "Venue Level"}
                  </Chip>
                  <span className="font-mono text-xs">
                    {truncateAddress(effectiveAC!)}
                  </span>
                </div>
              )}
            </div>

            {/* Whitelist management */}
            {isWhitelist && (
              <Button
                size="sm"
                variant="flat"
                onPress={() => setWhitelistOpen(true)}
              >
                Manage Whitelist
              </Button>
            )}

            <Divider />

            {/* Set market-level AC override */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                Set Market-Level Override
              </span>
              <p className="text-xs text-default-400">
                Override the venue-level trading access with a market-specific
                contract.
              </p>
              <div className="flex gap-2">
                <Input
                  errorMessage={
                    acInput.length > 0 && !isAddress(acInput)
                      ? "Invalid address"
                      : undefined
                  }
                  isInvalid={acInput.length > 0 && !isAddress(acInput)}
                  placeholder="0x... access control contract"
                  size="sm"
                  value={acInput}
                  onValueChange={setAcInput}
                />
                <Button
                  color="primary"
                  isDisabled={!isAddress(acInput)}
                  isLoading={isLoading}
                  size="sm"
                  onPress={handleSetAC}
                >
                  Set
                </Button>
              </div>
            </div>

            {/* Remove override */}
            {hasMarketOverride && (
              <>
                <Divider />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">
                    Remove Market Override
                  </span>
                  <p className="text-xs text-default-400">
                    Remove the market-level override to fall back to venue-level
                    access control.
                  </p>
                  <Button
                    color="danger"
                    isLoading={isLoading}
                    size="sm"
                    variant="flat"
                    onPress={handleRemoveOverride}
                  >
                    Remove Override
                  </Button>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {isWhitelist && effectiveAC && (
        <WhitelistManagementModal
          acContract={effectiveAC as `0x${string}`}
          isOpen={whitelistOpen}
          title={
            hasMarketOverride
              ? "Market Trading Whitelist"
              : "Venue Trading Whitelist"
          }
          onClose={() => setWhitelistOpen(false)}
        />
      )}
    </>
  );
}
