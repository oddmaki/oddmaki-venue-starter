'use client';

import { Suspense } from 'react';
import { CategoryFilter } from '@/features/markets/components/CategoryFilter';

export function CategoryNav() {
  return (
    <div className="container mx-auto max-w-7xl px-3 sm:px-6 pt-2">
      <Suspense>
        <CategoryFilter />
      </Suspense>
    </div>
  );
}
