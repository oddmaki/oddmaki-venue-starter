'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@heroui/button';
import { ChevronDownIcon } from '@/components/icons';

interface TradingModeDropdownProps {
  mode: 'market' | 'limit';
  onModeChange: (mode: 'market' | 'limit') => void;
  onSplitOpen: () => void;
  onMergeOpen: () => void;
}

const MODE_LABELS: Record<'market' | 'limit', string> = {
  market: 'Market',
  limit: 'Limit',
};

function ChevronRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const MENU_ITEM =
  'flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm hover:bg-default-100 cursor-pointer transition-colors';

export function TradingModeDropdown({
  mode,
  onModeChange,
  onSplitOpen,
  onMergeOpen,
}: TradingModeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreItemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const moreTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Position state for the portal-rendered menus
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [submenuPos, setSubmenuPos] = useState({ top: 0, left: 0 });

  // Recompute main menu position when opened
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.right,
    });
  }, [isOpen]);

  // Recompute submenu position when shown
  useLayoutEffect(() => {
    if (!showMore || !moreItemRef.current) return;
    const rect = moreItemRef.current.getBoundingClientRect();
    setSubmenuPos({
      top: rect.top,
      left: rect.right + 4,
    });
  }, [showMore]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target) ||
        submenuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
      setShowMore(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setShowMore(false);
  }, []);

  const handleSelect = useCallback(
    (action: string) => {
      switch (action) {
        case 'market':
          onModeChange('market');
          break;
        case 'limit':
          onModeChange('limit');
          break;
        case 'split':
          onSplitOpen();
          break;
        case 'merge':
          onMergeOpen();
          break;
      }
      close();
    },
    [onModeChange, onSplitOpen, onMergeOpen, close],
  );

  const handleMoreEnter = () => {
    clearTimeout(moreTimeoutRef.current);
    setShowMore(true);
  };

  const handleMoreLeave = () => {
    moreTimeoutRef.current = setTimeout(() => setShowMore(false), 150);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="flat"
        size="sm"
        endContent={<ChevronDownIcon size={14} />}
        onPress={() => setIsOpen((v) => !v)}
      >
        {MODE_LABELS[mode]}
      </Button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed bg-content1 border border-default-200 rounded-lg shadow-lg p-1 min-w-[120px] z-[9999]"
            style={{ top: menuPos.top, right: window.innerWidth - menuPos.left }}
          >
            <button
              className={`${MENU_ITEM} ${mode === 'market' ? 'text-primary' : ''}`}
              onClick={() => handleSelect('market')}
            >
              Market
            </button>
            <button
              className={`${MENU_ITEM} ${mode === 'limit' ? 'text-primary' : ''}`}
              onClick={() => handleSelect('limit')}
            >
              Limit
            </button>

            {/* More → submenu */}
            <div
              ref={moreItemRef}
              onMouseEnter={handleMoreEnter}
              onMouseLeave={handleMoreLeave}
            >
              <button className={MENU_ITEM}>
                <span>More</span>
                <ChevronRightIcon />
              </button>
            </div>
          </div>,
          document.body,
        )}

      {isOpen &&
        showMore &&
        createPortal(
          <div
            ref={submenuRef}
            className="fixed bg-content1 border border-default-200 rounded-lg shadow-lg p-1 min-w-[100px] z-[9999]"
            style={{ top: submenuPos.top, left: submenuPos.left }}
            onMouseEnter={handleMoreEnter}
            onMouseLeave={handleMoreLeave}
          >
            <button
              className={MENU_ITEM}
              onClick={() => handleSelect('merge')}
            >
              Merge
            </button>
            <button
              className={MENU_ITEM}
              onClick={() => handleSelect('split')}
            >
              Split
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
