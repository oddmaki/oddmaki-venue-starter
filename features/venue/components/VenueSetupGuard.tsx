"use client";

import type { ReactNode } from "react";

import { Alert } from "@heroui/alert";
import { Code } from "@heroui/code";
import { Link } from "@heroui/link";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Snippet } from "@heroui/snippet";

import { getVenueId } from "@/config/venue.config";
import { ACTIVE_CHAIN } from "@/lib/oddmaki/chain";

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

          <ModalBody className="flex flex-col gap-5 pb-6">
            <ol className="flex flex-col gap-4 text-sm text-default-700">
              <li className="flex flex-col gap-2">
                <div>
                  <span className="font-semibold">1. Create a venue</span> at{" "}
                  <Link
                    isExternal
                    showAnchorIcon
                    href="https://app.oddmaki.com"
                    size="sm"
                  >
                    app.oddmaki.com
                  </Link>
                  .
                </div>
              </li>

              <li className="flex flex-col gap-2">
                <div>
                  <span className="font-semibold">2. Add it to</span>{" "}
                  <Code size="sm">.env.local</Code>:
                </div>
                <Snippet
                  hideSymbol
                  className="w-full"
                  size="sm"
                  variant="bordered"
                  color="primary"
                >
                  NEXT_PUBLIC_VENUE_ID=&lt;your-id&gt;
                </Snippet>
              </li>

              <li>
                <span className="font-semibold">3. Restart</span> the dev
                server.
              </li>
            </ol>

            <Alert
              description={
                <span className="text-sm">
                  This app is configured for{" "}
                  <span className="font-semibold">{ACTIVE_CHAIN.name}</span>{" "}
                  (<Code color="secondary" size="sm">{ACTIVE_CHAIN.id}</Code>).
                  <br />
                  Make sure your venue was created on that same chain, or update{" "}
                  <Code size="sm">NEXT_PUBLIC_CHAIN_ID</Code> to target a
                  different one.
                </span>
              }
              title="Chain must match"
              variant="faded"
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return <>{children}</>;
}
