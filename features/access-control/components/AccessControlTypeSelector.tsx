"use client";

import type { AccessControlType } from "../hooks/useDeployAccessControl";

import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";

const AC_TYPE_OPTIONS = [
  { key: "public", label: "Public (no restrictions)" },
  { key: "whitelist", label: "Whitelist" },
  { key: "nft-erc721", label: "NFT Gated (ERC-721)" },
  { key: "nft-erc1155", label: "NFT Gated (ERC-1155)" },
  { key: "token", label: "Token Gated (ERC-20)" },
  { key: "custom", label: "Custom Contract Address" },
];

interface AccessControlTypeSelectorProps {
  label: string;
  value: AccessControlType;
  onChange: (type: AccessControlType) => void;
  customAddress?: string;
  onCustomAddressChange?: (address: string) => void;
  nftContract?: string;
  onNftContractChange?: (address: string) => void;
  nftTokenId?: string;
  onNftTokenIdChange?: (tokenId: string) => void;
  tokenContract?: string;
  onTokenContractChange?: (address: string) => void;
  tokenMinBalance?: string;
  onTokenMinBalanceChange?: (balance: string) => void;
}

export function AccessControlTypeSelector({
  label,
  value,
  onChange,
  customAddress = "",
  onCustomAddressChange,
  nftContract = "",
  onNftContractChange,
  nftTokenId = "0",
  onNftTokenIdChange,
  tokenContract = "",
  onTokenContractChange,
  tokenMinBalance = "",
  onTokenMinBalanceChange,
}: AccessControlTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Select
        label={label}
        selectedKeys={[value]}
        size="sm"
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;

          if (selected) onChange(selected as AccessControlType);
        }}
      >
        {AC_TYPE_OPTIONS.map((opt) => (
          <SelectItem key={opt.key}>{opt.label}</SelectItem>
        ))}
      </Select>

      {(value === "nft-erc721" || value === "nft-erc1155") && (
        <>
          <Input
            label="NFT Contract Address"
            placeholder="0x..."
            size="sm"
            value={nftContract}
            onValueChange={onNftContractChange}
          />
          {value === "nft-erc1155" && (
            <Input
              label="Token ID"
              placeholder="0"
              size="sm"
              type="number"
              value={nftTokenId}
              onValueChange={onNftTokenIdChange}
            />
          )}
        </>
      )}

      {value === "token" && (
        <>
          <Input
            label="Token Contract Address"
            placeholder="0x..."
            size="sm"
            value={tokenContract}
            onValueChange={onTokenContractChange}
          />
          <Input
            label="Minimum Balance"
            placeholder="1000"
            size="sm"
            type="number"
            value={tokenMinBalance}
            onValueChange={onTokenMinBalanceChange}
          />
        </>
      )}

      {value === "custom" && (
        <Input
          label="Access Control Contract Address"
          placeholder="0x..."
          size="sm"
          value={customAddress}
          onValueChange={onCustomAddressChange}
        />
      )}
    </div>
  );
}
