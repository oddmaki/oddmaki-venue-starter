"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

import { useToggleMarketPause } from "../hooks/useToggleMarketPause";

interface PauseMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
}

export function PauseMarketModal({
  isOpen,
  onClose,
  marketId,
}: PauseMarketModalProps) {
  const { pauseMarket, unpauseMarket, isLoading } =
    useToggleMarketPause(marketId);

  const handlePause = async () => {
    const hash = await pauseMarket();

    if (hash) onClose();
  };

  const handleUnpause = async () => {
    const hash = await unpauseMarket();

    if (hash) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Market Trading Status</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-500">
            Pausing a market blocks all new trades and order matching. Existing
            orders can still be cancelled. Resuming re-enables trading.
          </p>

          <div className="flex flex-col gap-3 mt-2">
            <Button
              color="warning"
              isLoading={isLoading}
              variant="flat"
              onPress={handlePause}
            >
              Pause Trading
            </Button>
            <Button
              color="success"
              isLoading={isLoading}
              variant="flat"
              onPress={handleUnpause}
            >
              Resume Trading
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
