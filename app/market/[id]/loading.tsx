import { MarketDetailSkeleton } from "@/features/market-detail/components/MarketDetailSkeleton";

export default function MarketDetailLoading() {
  return (
    <section className="flex flex-col gap-6 pt-4 pb-8 md:pt-6 md:pb-10">
      <MarketDetailSkeleton />
    </section>
  );
}
