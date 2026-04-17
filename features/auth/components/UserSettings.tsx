'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/popover';
import { Divider } from '@heroui/divider';
import { Switch } from '@heroui/switch';
import { useTheme } from 'next-themes';
import NextLink from 'next/link';
import { AddressAvatar } from '@/lib/identity/avatar';
import { generatePseudonym, shortenAddress } from '@/lib/identity/pseudonym';
import { useVenueData } from '@/features/venue';
import { VenueModalsContainer, type SectionKey } from '@/features/venue/components/VenueModals';
import { SunFilledIcon, MoonFilledIcon, ChevronDownIcon } from '@/components/icons';

export interface UserSettingsProps {
  address: string;
  switchNetwork?: () => void;
  disconnect: () => void;
}

const VENUE_ITEMS: { key: SectionKey; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'branding', label: 'Branding' },
  { key: 'access-control', label: 'Access Control' },
  { key: 'fees', label: 'Fees' },
  { key: 'oracle', label: 'Oracle' },
];

export function UserSettings({ address, switchNetwork, disconnect }: UserSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVenueSub, setShowVenueSub] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { venue, isOperator } = useVenueData();
  const [activeVenueModal, setActiveVenueModal] = useState<SectionKey | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const venueSubRef = useRef<HTMLDivElement>(null);
  const venueItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close venue sub-popover when main closes
  useEffect(() => {
    if (!isOpen) setShowVenueSub(false);
  }, [isOpen]);

  const pseudonym = generatePseudonym(address);
  const short = shortenAddress(address);
  const isDark = mounted ? theme === 'dark' : true;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleOpenVenueModal = (key: SectionKey) => {
    setIsOpen(false);
    setShowVenueSub(false);
    setActiveVenueModal(key);
  };

  const closeVenueModal = () => setActiveVenueModal(null);

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

  // Venue sub-popover hover
  const venueHoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const openVenueSub = useCallback(() => {
    clearTimeout(venueHoverTimeoutRef.current);
    setShowVenueSub(true);
  }, []);

  const closeVenueSub = useCallback(() => {
    venueHoverTimeoutRef.current = setTimeout(() => {
      setShowVenueSub(false);
    }, 150);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={openOnHover}
        onMouseLeave={closeOnLeave}
      >
        <Popover
          placement="bottom-end"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          triggerScaleOnOpen={false}
        >
          <PopoverTrigger>
            <button
              className="flex items-center gap-1.5 cursor-pointer rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="User settings"
            >
              <AddressAvatar address={address} size={32} />
              <ChevronDownIcon
                size={14}
                className={`text-default-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                  <span className="text-sm font-semibold truncate">{pseudonym}</span>
                  <button
                    className="flex items-center gap-1 text-xs text-default-500 hover:text-default-700 transition-colors cursor-pointer"
                    onClick={handleCopy}
                  >
                    <span className="font-mono">{short}</span>
                    <span className="text-[10px]">{copied ? 'Copied!' : ''}</span>
                  </button>
                </div>
              </div>

              <Divider />

              {/* Navigation */}
              <div className="flex flex-col py-1">
                <NextLink
                  href={`/trader/${address}`}
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-default-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </NextLink>

                <NextLink
                  href="/leaderboard"
                  className="flex items-center px-4 py-2.5 text-sm hover:bg-default-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Leaderboard
                </NextLink>

                {isOperator && venue && (
                  <div className="relative">
                    <button
                      ref={venueItemRef}
                      className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-default-100 transition-colors cursor-pointer w-full text-left"
                      onMouseEnter={openVenueSub}
                      onMouseLeave={closeVenueSub}
                      onClick={() => setShowVenueSub((v) => !v)}
                      aria-expanded={showVenueSub}
                    >
                      <span>Venue</span>
                      <ChevronDownIcon
                        size={14}
                        className={`text-default-500 transition-transform sm:-rotate-90 ${showVenueSub ? 'rotate-180 sm:-rotate-90' : ''}`}
                      />
                    </button>

                    {/* Venue submenu — inline on mobile, flyout to the left on sm+ */}
                    {showVenueSub && (
                      <div
                        ref={venueSubRef}
                        className="bg-default-50 sm:bg-content1 sm:absolute sm:right-full sm:top-0 sm:mr-1 sm:w-48 sm:rounded-xl sm:shadow-lg sm:border sm:border-default-200 py-1 z-50"
                        onMouseEnter={openVenueSub}
                        onMouseLeave={closeVenueSub}
                      >
                        {VENUE_ITEMS.map(({ key, label }) => (
                          <button
                            key={key}
                            className="flex items-center pl-8 pr-4 sm:px-4 py-2.5 text-sm hover:bg-default-100 transition-colors cursor-pointer w-full text-left"
                            onClick={() => handleOpenVenueModal(key)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Divider />

              {/* Settings */}
              <div className="flex flex-col py-1">
                <div className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    {isDark ? <MoonFilledIcon size={16} /> : <SunFilledIcon size={16} />}
                    <span>Dark Mode</span>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={isDark}
                    onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
                    aria-label="Toggle dark mode"
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

      {/* Venue modals render outside the popover */}
      {venue && (
        <VenueModalsContainer
          activeModal={activeVenueModal}
          onClose={closeVenueModal}
          venue={venue}
          onManageWhitelist={(key) => setActiveVenueModal(key)}
        />
      )}
    </>
  );
}
