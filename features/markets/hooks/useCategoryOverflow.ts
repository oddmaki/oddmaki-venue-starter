"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Hook that detects how many category items fit in a container
 * before needing a "More" overflow button.
 *
 * Uses ResizeObserver to recalculate on container resize.
 */
export function useCategoryOverflow(itemCount: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleCount, setVisibleCount] = useState(itemCount);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // Approximate width of the "More" button + gap
    const MORE_BUTTON_WIDTH = 80;

    const calculate = () => {
      const containerWidth = container.clientWidth;
      const items = itemRefs.current;
      let count = items.length;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!item) continue;

        const rightEdge =
          item.offsetLeft - container.offsetLeft + item.offsetWidth;
        // If not the last item, reserve space for "More" button
        const needsMore = i < items.length - 1;
        const threshold = needsMore
          ? containerWidth - MORE_BUTTON_WIDTH
          : containerWidth;

        if (rightEdge > threshold) {
          count = i;
          break;
        }
      }

      setVisibleCount(count);
    };

    const observer = new ResizeObserver(calculate);

    observer.observe(container);
    // Initial calculation after first paint
    calculate();

    return () => observer.disconnect();
  }, [itemCount]);

  return { containerRef, setItemRef, visibleCount };
}
