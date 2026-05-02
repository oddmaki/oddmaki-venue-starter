"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export function MarketSkeleton() {
  return (
    <Card className="w-full h-[220px]">
      <CardHeader className="flex flex-col items-start gap-2">
        <div className="flex justify-between w-full items-start">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded" />
        </div>
        <Skeleton className="h-6 w-full rounded" />
        <Skeleton className="h-6 w-3/4 rounded" />
      </CardHeader>

      <CardBody className="gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardBody>

      <CardFooter>
        <Skeleton className="h-4 w-32 rounded" />
      </CardFooter>
    </Card>
  );
}
