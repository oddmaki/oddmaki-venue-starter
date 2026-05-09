"use client";

import type { ReactNode } from "react";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";

import { getVenueId } from "@/config/venue.config";

interface VenueSetupGuardProps {
  children: ReactNode;
}

/**
 * Shows a notice if NEXT_PUBLIC_VENUE_ID is not configured.
 * The user must set the env var and restart the app.
 */
export function VenueSetupGuard({ children }: VenueSetupGuardProps) {
  const venueId = getVenueId();

  if (venueId === undefined) {
    return (
      <Modal hideCloseButton isOpen isDismissable={false} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Venue Not Configured</h2>
            <p className="text-sm text-default-500 font-normal">
              This starter needs a venue ID to display markets.
            </p>
          </ModalHeader>

          <ModalBody className="flex flex-col gap-4 pb-6">
            <p className="text-sm text-default-600">
              Set{" "}
              <code className="text-xs bg-default-100 px-1 py-0.5 rounded">
                NEXT_PUBLIC_VENUE_ID=&lt;your-id&gt;
              </code>{" "}
              in your{" "}
              <code className="text-xs bg-default-100 px-1 py-0.5 rounded">
                .env.local
              </code>{" "}
              file and restart the dev server.
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return <>{children}</>;
}
