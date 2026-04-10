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

const MENU_ITEM =
  'flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm hover:bg-default-100 cursor-pointer transition-colors';

export function TradingModeDropdown({
  mode,
  onModeChange,
  onSplitOpen,
  onMergeOpen,
}: TradingModeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Position state for the portal-rendered menu
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Recompute menu position when opened
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      left: rect.right,
    });
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
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

  // Hover opens dropdown
  const handleTriggerEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  };

  const handleTriggerLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const handleMenuEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
  };

  const handleMenuLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  // Click toggles between market/limit and closes the menu
  const handleClick = () => {
    onModeChange(mode === 'market' ? 'limit' : 'market');
    setIsOpen(false);
  };

  return (
    <>
      <div
        onMouseEnter={handleTriggerEnter}
        onMouseLeave={handleTriggerLeave}
      >
        <Button
          ref={triggerRef}
          variant="flat"
          size="sm"
          endContent={<ChevronDownIcon size={14} />}
          onPress={handleClick}
        >
          {MODE_LABELS[mode]}
        </Button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed bg-content1 border border-default-200 rounded-lg shadow-lg p-1 min-w-[120px] z-[9999]"
            style={{ top: menuPos.top, right: window.innerWidth - menuPos.left }}
            onMouseEnter={handleMenuEnter}
            onMouseLeave={handleMenuLeave}
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

            <div className="my-1 border-t border-default-200" />

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
