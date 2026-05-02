"use client";

import { SemiCircularProgress } from "@/components/icons";

interface MarketProgressProps {
  percentage: number;
  className?: string;
}

export function MarketProgress({
  percentage,
  className = "",
}: MarketProgressProps) {
  const isHighChance = percentage >= 50;
  const progressColor = isHighChance ? "text-primary" : "text-secondary";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <SemiCircularProgress
          className={`${progressColor} transition-colors duration-300`}
          percentage={percentage}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className={`text-lg font-bold ${progressColor} leading-none`}>
            {percentage}%
          </span>
          <span className="text-[10px] text-default-400 leading-tight">
            chance
          </span>
        </div>
      </div>
    </div>
  );
}
