"use client";

import { Skeleton } from "@heroui/skeleton";
import { Card, CardHeader, CardBody } from "@heroui/card";

export function MarketDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header: back button + title + chip */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2 flex-1">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <Skeleton className="h-8 w-3/4 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        {/* Price + stats row */}
        <div className="flex flex-wrap gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Orderbook | Trading panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          {/* Chart skeleton */}
          <Card>
            <CardHeader className="flex justify-between items-center pb-0">
              <Skeleton className="h-5 w-24 rounded" />
              <div className="flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={`tf-${i}`} className="h-7 w-8 rounded-lg" />
                ))}
              </div>
            </CardHeader>
            <CardBody>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardBody>
          </Card>

          {/* Orderbook skeleton */}
          <Card className="h-full">
            <CardHeader className="flex justify-between items-center pb-0">
              <Skeleton className="h-5 w-24 rounded" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-14 rounded-lg" />
                <Skeleton className="h-8 w-14 rounded-lg" />
              </div>
            </CardHeader>
            <CardBody className="px-0 pb-2">
              <div className="flex flex-col gap-1 px-2 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={`ask-${i}`}
                    className="w-full h-7 rounded-md"
                  />
                ))}
                <div className="h-7 flex items-center px-2">
                  <Skeleton className="h-4 w-full rounded" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={`bid-${i}`}
                    className="w-full h-7 rounded-md"
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Trading panel skeleton */}
        <Card>
          <CardHeader className="flex flex-col gap-3 pb-0">
            <div className="flex justify-between items-center w-full">
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <div className="flex gap-1 w-full">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
            <div className="flex gap-1 w-full">
              <Skeleton className="h-8 flex-1 rounded-lg" />
              <Skeleton className="h-8 flex-1 rounded-lg" />
            </div>
          </CardHeader>
          <CardBody className="gap-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardBody>
        </Card>
      </div>

      {/* Description | Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: description skeleton */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-default-200 p-4">
            <Skeleton className="h-5 w-28 rounded mb-3" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>
        </div>

        {/* Right: stacked panels skeleton */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-0">
              <Skeleton className="h-5 w-28 rounded" />
            </CardHeader>
            <CardBody className="gap-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="gap-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4 rounded" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
