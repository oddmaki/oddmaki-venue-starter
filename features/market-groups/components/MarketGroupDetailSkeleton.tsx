"use client";

import { Skeleton } from "@heroui/skeleton";
import { Card, CardHeader, CardBody } from "@heroui/card";

export function MarketGroupDetailSkeleton() {
  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2 flex-1">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <Skeleton className="h-8 w-3/4 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_338px] gap-4 items-start">
        {/* Left: Outcomes list */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20 rounded" />
            </CardHeader>
            <CardBody className="gap-0 p-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="px-4 py-3 flex items-center justify-between border-b border-default-100 last:border-b-0"
                >
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-10 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Orderbook skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24 rounded" />
            </CardHeader>
            <CardBody>
              <Skeleton className="h-[280px] w-full rounded-lg" />
            </CardBody>
          </Card>
        </div>

        {/* Right: Trading panel */}
        <Card>
          <CardHeader className="flex flex-col gap-3 pb-0">
            <Skeleton className="h-5 w-24 rounded" />
            <div className="flex gap-1 w-full">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
          </CardHeader>
          <CardBody className="gap-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
