"use client";

import { Card, CardBody } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

interface ResolvedOutcomeCardProps {
  outcomes: string[];
  resolvedOutcome?: number | null;
}

export function ResolvedOutcomeCard({
  outcomes,
  resolvedOutcome,
}: ResolvedOutcomeCardProps) {
  if (resolvedOutcome == null) {
    return (
      <Card>
        <CardBody>
          <div className="flex flex-col items-center gap-3 py-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-5 w-32 rounded-lg" />
          </div>
        </CardBody>
      </Card>
    );
  }

  const winningLabel = outcomes[resolvedOutcome] ?? "Unknown";

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center gap-3 py-6">
          {/* Blue checkmark circle */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                fillRule="evenodd"
              />
            </svg>
          </div>

          <span className="text-lg font-semibold">Outcome: {winningLabel}</span>
        </div>
      </CardBody>
    </Card>
  );
}
