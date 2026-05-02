"use client";

import { useState } from "react";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Tooltip } from "@heroui/tooltip";

import {
  AddressAvatar,
  generatePseudonym,
  shortenAddress,
} from "@/lib/identity";

interface TraderProfileHeaderProps {
  address: string;
  user: any | null;
  isLoading: boolean;
}

function formatDate(timestamp: string): string {
  const date = new Date(parseInt(timestamp) * 1000);

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function TraderProfileHeader({
  address,
  user,
  isLoading,
}: TraderProfileHeaderProps) {
  const pseudonym = generatePseudonym(address);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-4">
      <AddressAvatar address={address} size={64} />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{pseudonym}</h1>
        <div className="flex items-center gap-2">
          <Tooltip content={copied ? "Copied!" : address} placement="bottom">
            <Chip
              className="cursor-pointer font-mono"
              color="default"
              size="sm"
              variant="flat"
              onClick={handleCopy}
            >
              {shortenAddress(address)}
            </Chip>
          </Tooltip>
          {isLoading ? (
            <Skeleton className="h-4 w-24 rounded" />
          ) : user ? (
            <span className="text-sm text-default-500">
              Joined {formatDate(user.firstSeenAt)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
