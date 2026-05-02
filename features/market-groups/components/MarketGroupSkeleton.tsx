"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export function MarketGroupSkeleton() {
  return (
    <Card className="w-full h-[220px]">
      <CardHeader className="flex flex-col items-start gap-2 pt-4 pb-0">
        <div className="flex justify-between w-full items-start">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardBody className="gap-0 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          </div>
        ))}
      </CardBody>

      <CardFooter>
        <Skeleton className="h-4 w-24 rounded" />
      </CardFooter>
    </Card>
  );
}
