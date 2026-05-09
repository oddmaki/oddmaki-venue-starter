"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Divider } from "@heroui/divider";
import { Switch } from "@heroui/switch";
import { useTheme } from "next-themes";
import NextLink from "next/link";

import { AddressAvatar } from "@/lib/identity/avatar";
import { generatePseudonym, shortenAddress } from "@/lib/identity/pseudonym";
import {
  SunFilledIcon,
  MoonFilledIcon,
  ChevronDownIcon,
} from "@/components/icons";

export interface UserSettingsProps {
  address: string;
  switchNetwork?: () => void;
  disconnect: () => void;
}

export function UserSettings({
  address,
  switchNetwork,
  disconnect,
}: UserSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setMounted(true);
  }, []);

  const pseudonym = generatePseudonym(address);
  const short = shortenAddress(address);
  const isDark = mounted ? theme === "dark" : true;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Hover open/close for main popover
  const openOnHover = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  }, []);

  const closeOnLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={openOnHover}
      onMouseLeave={closeOnLeave}
    >
      <Popover
        isOpen={isOpen}
        placement="bottom-end"
        triggerScaleOnOpen={false}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger>
          <button
            aria-label="User settings"
            className="flex items-center gap-1.5 cursor-pointer rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <AddressAvatar address={address} size={32} />
            <ChevronDownIcon
              className={`text-default-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              size={14}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-64 p-0">
          <div
            className="flex flex-col"
            onMouseEnter={openOnHover}
            onMouseLeave={closeOnLeave}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4">
              <AddressAvatar address={address} size={40} />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">
                  {pseudonym}
                </span>
                <button
                  className="flex items-center gap-1 text-xs text-default-500 hover:text-default-700 transition-colors cursor-pointer"
                  onClick={handleCopy}
                >
                  <span className="font-mono">{short}</span>
                  <span className="text-[10px]">{copied ? "Copied!" : ""}</span>
                </button>
              </div>
            </div>

            <Divider />

            {/* Navigation */}
            <div className="flex flex-col py-1">
              <NextLink
                className="flex items-center px-4 py-2.5 text-sm hover:bg-default-100 transition-colors"
                href={`/trader/${address}`}
                onClick={() => setIsOpen(false)}
              >
                My Profile
              </NextLink>

              <NextLink
                className="flex items-center px-4 py-2.5 text-sm hover:bg-default-100 transition-colors"
                href="/leaderboard"
                onClick={() => setIsOpen(false)}
              >
                Leaderboard
              </NextLink>
            </div>

            <Divider />

            {/* Settings */}
            <div className="flex flex-col py-1">
              <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <MoonFilledIcon size={16} />
                  ) : (
                    <SunFilledIcon size={16} />
                  )}
                  <span>Dark Mode</span>
                </div>
                <Switch
                  aria-label="Toggle dark mode"
                  isSelected={isDark}
                  size="sm"
                  onValueChange={(val) => setTheme(val ? "dark" : "light")}
                />
              </div>

              {switchNetwork && (
                <button
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-default-100 transition-colors cursor-pointer w-full text-left"
                  onClick={() => {
                    setIsOpen(false);
                    switchNetwork();
                  }}
                >
                  Switch Network
                </button>
              )}

              <button
                className="flex items-center px-4 py-2.5 text-sm text-danger hover:bg-default-100 transition-colors cursor-pointer w-full text-left"
                onClick={() => {
                  setIsOpen(false);
                  disconnect();
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
