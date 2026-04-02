'use client';

import { useState, useEffect } from 'react';
import { formatCountdown } from '../lib/format';

interface CountdownTimerProps {
  closeTime: bigint;
  className?: string;
}

export function CountdownTimer({ closeTime, className }: CountdownTimerProps) {
  const [display, setDisplay] = useState(() => formatCountdown(closeTime));

  useEffect(() => {
    setDisplay(formatCountdown(closeTime));

    const interval = setInterval(() => {
      const next = formatCountdown(closeTime);
      setDisplay(next);
      if (next === 'Expired') clearInterval(interval);
    }, 1_000);

    return () => clearInterval(interval);
  }, [closeTime]);

  const isExpired = display === 'Expired';

  // Split into numeric parts for large display
  const parts = isExpired ? null : display.match(/(\d+)\s*(\w+)\s*(\d+)?\s*(\w+)?/);
  const major = parts?.[1];
  const majorUnit = parts?.[2]?.toUpperCase();
  const minor = parts?.[3];
  const minorUnit = parts?.[4]?.toUpperCase();

  return (
    <div className={className}>
      {isExpired ? (
        <span className="font-mono text-sm text-danger font-semibold">Expired</span>
      ) : (
        <div className="flex items-baseline gap-0.5">
          <span className="font-mono text-2xl font-bold text-danger">{major}</span>
          <span className="text-[10px] text-default-400 uppercase mr-1">{majorUnit}</span>
          {minor && (
            <>
              <span className="font-mono text-2xl font-bold text-danger">{minor}</span>
              <span className="text-[10px] text-default-400 uppercase">{minorUnit}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
