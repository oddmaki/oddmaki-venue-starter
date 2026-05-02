"use client";

import { Card, CardBody } from "@heroui/card";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No markets found",
  description = "There are currently no active markets. Check back later!",
}: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardBody className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-semibold text-default-600">{title}</h3>
          <p className="text-default-400">{description}</p>
        </div>
      </CardBody>
    </Card>
  );
}
