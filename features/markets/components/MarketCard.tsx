"use client";

import type { FormattedMarket } from "../types";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import NextLink from "next/link";

import { MarketStatus } from "../types";

import { MarketProgress } from "./MarketProgress";
import { MarketImage } from "./MarketImage";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function ResolvedOutcomePill({
  outcomes,
  yesPrice,
  noPrice,
}: {
  outcomes: string[];
  yesPrice: number;
  noPrice: number;
}) {
  const outcome0Won = yesPrice >= noPrice;
  const winnerName = outcome0Won ? outcomes[0] || "Yes" : outcomes[1] || "No";

  return (
    <div
      className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold ${
        outcome0Won
          ? "bg-primary/10 text-primary"
          : "bg-secondary/10 text-secondary"
      }`}
    >
      {winnerName}
      {outcome0Won ? (
        <CheckIcon className="w-5 h-5" />
      ) : (
        <XIcon className="w-5 h-5" />
      )}
    </div>
  );
}

interface MarketCardProps {
  market: FormattedMarket;
}

export function MarketCard({ market }: MarketCardProps) {
  const statusColor = {
    [MarketStatus.DRAFT]: "warning" as const,
    [MarketStatus.ACTIVE]: "primary" as const,
    [MarketStatus.RESOLVED]: "default" as const,
    [MarketStatus.INVALID]: "danger" as const,
  }[market.status];

  // Calculate chance percentage for the first outcome
  const chancePercentage = Math.round(market.yesPrice);

  return (
    <NextLink className="block" href={`/market/${market.marketId}`}>
      <Card className="w-full h-[180px] hover:scale-[1.02] transition-transform cursor-pointer">
        <CardHeader className="flex flex-col items-start gap-2 pb-0 flex-1">
          <div className="flex justify-between w-full items-start gap-3">
            <div className="flex items-start gap-2 flex-1">
              <MarketImage
                metadataURI={market.metadataURI}
                name={market.question}
                size="sm"
              />
              <h3 className="text-sm font-semibold flex-1 line-clamp-3 text-pretty min-w-0">
                {market.question}
              </h3>
            </div>
            {market.status !== MarketStatus.RESOLVED && (
              <MarketProgress
                className="flex-shrink-0 -mt-1"
                percentage={chancePercentage}
              />
            )}
          </div>
        </CardHeader>

        <CardBody className="gap-2 py-2 flex-shrink-0 flex-grow-0">
          {market.status === MarketStatus.RESOLVED ? (
            <ResolvedOutcomePill
              noPrice={market.noPrice}
              outcomes={market.outcomes}
              yesPrice={market.yesPrice}
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg bg-primary/10 py-2.5 text-center text-sm font-semibold text-primary">
                {market.outcomes[0] || "Yes"} {Math.round(market.yesPrice)}¢
              </div>
              <div className="flex-1 rounded-lg bg-secondary/10 py-2.5 text-center text-sm font-semibold text-secondary">
                {market.outcomes[1] || "No"} {Math.round(market.noPrice)}¢
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter className="flex flex-col gap-1 pt-0 flex-shrink-0">
          <div className="flex justify-between w-full text-xs text-default-400">
            <span>
              {market.totalOrders}{" "}
              {parseInt(market.totalOrders) === 1 ? "order" : "orders"}
            </span>
            <span>{market.volumeFormatted} Vol.</span>
          </div>
        </CardFooter>
      </Card>
    </NextLink>
  );
}
