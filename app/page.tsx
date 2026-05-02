import { Suspense } from "react";

import { MarketGrid } from "@/features/markets/components";
import { VenueSetupGuard } from "@/features/venue/components";

export default function Home() {
  return (
    <VenueSetupGuard>
      <section className="flex flex-col gap-4 pt-2 pb-8 md:pt-3 md:pb-10">
        <Suspense>
          <MarketGrid />
        </Suspense>
      </section>
    </VenueSetupGuard>
  );
}
