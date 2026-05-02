"use client";

import type { VenueMetadata } from "@oddmaki-protocol/sdk";
import type { VenueData } from "../hooks/useVenueData";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input, Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { formatUnits, parseUnits } from "viem";

import {
  useUpdateVenueFees,
  useUpdateOracleParams,
  useToggleVenuePause,
  useUpdateVenue,
} from "../hooks/useVenueManagement";

import { USDC_DECIMALS } from "@/lib/oddmaki/constants";
import { useWhitelistOwner } from "@/features/access-control/hooks/useWhitelistOwner";
import { WhitelistManagementModal } from "@/features/access-control/components/WhitelistManagementModal";
import { useMetadata } from "@/lib/ipfs/useMetadata";
import { uploadToIPFS } from "@/lib/ipfs";
import { shortenAddress } from "@/lib/identity/pseudonym";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type SectionKey =
  | "access-control"
  | "fees"
  | "oracle"
  | "general"
  | "branding"
  | "whitelist-trading"
  | "whitelist-creation";

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-default-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function AccessControlRow({
  label,
  acAddress,
  onManage,
}: {
  label: string;
  acAddress: string;
  onManage?: () => void;
}) {
  const isPublic = acAddress === ZERO_ADDRESS;
  const { data: owner, error: ownerError } = useWhitelistOwner(
    isPublic ? undefined : (acAddress as `0x${string}`),
  );
  const isWhitelist = !isPublic && !!owner && !ownerError;

  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-default-500">{label}</span>
      <div className="flex items-center gap-2">
        {isPublic ? (
          <Chip color="primary" size="sm" variant="flat">
            Public
          </Chip>
        ) : (
          <span className="font-mono text-xs">{shortenAddress(acAddress)}</span>
        )}
        {isWhitelist && onManage && (
          <Button size="sm" variant="flat" onPress={onManage}>
            Manage
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Access Control Modal ──────────────────────────────────────────────

export function AccessControlModal({
  isOpen,
  onClose,
  venue,
  onManageWhitelist,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
  onManageWhitelist: (key: "whitelist-trading" | "whitelist-creation") => void;
}) {
  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Access Control</ModalHeader>
        <ModalBody>
          <AccessControlRow
            acAddress={venue.tradingAccessControl}
            label="Trading"
            onManage={() => onManageWhitelist("whitelist-trading")}
          />
          <AccessControlRow
            acAddress={venue.creationAccessControl}
            label="Market Creation"
            onManage={() => onManageWhitelist("whitelist-creation")}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Fees Modal ────────────────────────────────────────────────────────

export function FeesModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const [venueFee, setVenueFee] = useState("");
  const [creatorFee, setCreatorFee] = useState("");
  const { updateFees, isLoading } = useUpdateVenueFees();

  useEffect(() => {
    if (isOpen) {
      setVenueFee(venue.venueFeeBps.toString());
      setCreatorFee(venue.creatorFeeBps.toString());
    }
  }, [isOpen, venue.venueFeeBps, venue.creatorFeeBps]);

  const handleSave = async () => {
    const vf = parseInt(venueFee, 10);
    const cf = parseInt(creatorFee, 10);

    if (isNaN(vf) || isNaN(cf)) return;
    await updateFees(vf, cf);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Fees</ModalHeader>
        <ModalBody>
          <Input
            description="Trading fee in basis points (1-200). 100 bps = 1%."
            label="Venue Fee (bps)"
            type="number"
            value={venueFee}
            onValueChange={setVenueFee}
          />
          <Input
            description={`Portion of venue fee shared with market creator (0-${venueFee}).`}
            label="Creator Fee (bps)"
            type="number"
            value={creatorFee}
            onValueChange={setCreatorFee}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isLoading} onPress={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Oracle Modal ──────────────────────────────────────────────────────

export function OracleModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const [reward, setReward] = useState("");
  const [bond, setBond] = useState("");
  const { updateOracleParams, isLoading } = useUpdateOracleParams();

  useEffect(() => {
    if (isOpen) {
      setReward(formatUnits(venue.umaRewardAmount, USDC_DECIMALS));
      setBond(formatUnits(venue.umaMinBond, USDC_DECIMALS));
    }
  }, [isOpen, venue.umaRewardAmount, venue.umaMinBond]);

  const handleSave = async () => {
    const r = parseFloat(reward);
    const b = parseFloat(bond);

    if (isNaN(r) || isNaN(b)) return;
    await updateOracleParams(
      parseUnits(reward, USDC_DECIMALS),
      parseUnits(bond, USDC_DECIMALS),
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Oracle</ModalHeader>
        <ModalBody>
          <Input
            description="Reward paid to the UMA asserter on successful resolution."
            label="UMA Reward (USDC)"
            type="number"
            value={reward}
            onValueChange={setReward}
          />
          <Input
            description="Minimum bond required to submit a UMA assertion."
            label="Min Bond (USDC)"
            type="number"
            value={bond}
            onValueChange={setBond}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isLoading} onPress={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── General Info Modal ────────────────────────────────────────────────

export function GeneralModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const { togglePause, isLoading: isPauseLoading } = useToggleVenuePause();

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader>General</ModalHeader>
        <ModalBody>
          <InfoRow
            label="Status"
            value={
              <div className="flex items-center gap-2">
                <Chip
                  color={venue.active ? "primary" : "danger"}
                  size="sm"
                  variant="flat"
                >
                  {venue.active ? "Active" : "Paused"}
                </Chip>
                <Switch
                  isDisabled={isPauseLoading}
                  isSelected={venue.active}
                  size="sm"
                  onValueChange={() => togglePause(venue.active)}
                />
              </div>
            }
          />
          <Divider className="my-1" />
          <InfoRow label="Venue ID" value={venue.venueId} />
          <InfoRow label="Name" value={venue.name} />
          <InfoRow
            label="Operator"
            value={
              <span className="font-mono text-xs">
                {shortenAddress(venue.operator)}
              </span>
            }
          />
          <InfoRow
            label="Fee Recipient"
            value={
              <span className="font-mono text-xs">
                {shortenAddress(venue.feeRecipient)}
              </span>
            }
          />
          <Divider className="my-1" />
          <InfoRow
            label="Default Tick Size"
            value={formatUnits(venue.defaultTickSize, 18)}
          />
          <InfoRow
            label="Market Creation Fee"
            value={`${formatUnits(venue.marketCreationFee, USDC_DECIMALS)} USDC`}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Branding Modal ───────────────────────────────────────────────────

export function BrandingModal({
  isOpen,
  onClose,
  venue,
}: {
  isOpen: boolean;
  onClose: () => void;
  venue: VenueData;
}) {
  const { data: existingMetadata } = useMetadata<VenueMetadata>(
    venue.metadata || undefined,
  );
  const { updateVenue, isLoading } = useUpdateVenue();

  const [venueUrl, setVenueUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && existingMetadata) {
      setVenueUrl(existingMetadata.venue_url ?? "");
      setDescription(existingMetadata.description ?? "");
    } else if (isOpen) {
      setVenueUrl("");
      setDescription("");
    }
  }, [isOpen, existingMetadata]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const hasMetadata = venueUrl.trim() || description.trim();
      let metadataURI = "";

      if (hasMetadata) {
        const metadata: VenueMetadata = {
          version: 1,
          ...(venueUrl.trim() && { venue_url: venueUrl.trim() }),
          ...(description.trim() && { description: description.trim() }),
        };

        metadataURI = await uploadToIPFS(metadata);
      }

      await updateVenue({
        name: venue.name,
        metadata: metadataURI,
        tradingAccessControl: venue.tradingAccessControl,
        creationAccessControl: venue.creationAccessControl,
        feeRecipient: venue.feeRecipient,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader>Branding</ModalHeader>
        <ModalBody>
          <Input
            description="Your project or venue website URL."
            label="Venue URL"
            placeholder="https://yoursite.com"
            value={venueUrl}
            onValueChange={setVenueUrl}
          />
          <Textarea
            description="Describe what your venue is about."
            label="Description"
            maxRows={4}
            minRows={2}
            placeholder="A brief description of your venue..."
            value={description}
            onValueChange={setDescription}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isLoading={isSaving || isLoading}
            onPress={handleSave}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// ── Container ────────────────────────────────────────────────────────

export function VenueModalsContainer({
  activeModal,
  onClose,
  venue,
  onManageWhitelist,
}: {
  activeModal: SectionKey | null;
  onClose: () => void;
  venue: VenueData;
  onManageWhitelist: (key: "whitelist-trading" | "whitelist-creation") => void;
}) {
  return (
    <>
      <GeneralModal
        isOpen={activeModal === "general"}
        venue={venue}
        onClose={onClose}
      />
      <BrandingModal
        isOpen={activeModal === "branding"}
        venue={venue}
        onClose={onClose}
      />
      <AccessControlModal
        isOpen={activeModal === "access-control"}
        venue={venue}
        onClose={onClose}
        onManageWhitelist={onManageWhitelist}
      />
      <FeesModal
        isOpen={activeModal === "fees"}
        venue={venue}
        onClose={onClose}
      />
      <OracleModal
        isOpen={activeModal === "oracle"}
        venue={venue}
        onClose={onClose}
      />
      {venue.tradingAccessControl !== ZERO_ADDRESS && (
        <WhitelistManagementModal
          acContract={venue.tradingAccessControl as `0x${string}`}
          isOpen={activeModal === "whitelist-trading"}
          title="Trading Whitelist"
          onClose={onClose}
        />
      )}
      {venue.creationAccessControl !== ZERO_ADDRESS && (
        <WhitelistManagementModal
          acContract={venue.creationAccessControl as `0x${string}`}
          isOpen={activeModal === "whitelist-creation"}
          title="Creation Whitelist"
          onClose={onClose}
        />
      )}
    </>
  );
}
