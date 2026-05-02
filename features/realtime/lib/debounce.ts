/**
 * Invalidation Debouncer
 *
 * Accumulates TanStack Query keys over a window (default 300ms) and flushes
 * them as a single deduplicated batch. Prevents hammering the subgraph when
 * a single transaction emits multiple events (e.g. matchOrders → OrderFilled +
 * TradeExecuted + TopOfBookChanged + FeesDistributed).
 */

type InvalidationCallback = (keys: readonly (readonly unknown[])[]) => void;

export function createInvalidationDebouncer(
  callback: InvalidationCallback,
  delayMs: number = 300,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const pendingSet = new Set<string>();
  let pendingKeys: (readonly unknown[])[] = [];

  function add(keys: readonly (readonly unknown[])[]) {
    for (const key of keys) {
      const serialized = JSON.stringify(key);

      if (!pendingSet.has(serialized)) {
        pendingSet.add(serialized);
        pendingKeys.push(key);
      }
    }

    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(flush, delayMs);
  }

  function flush() {
    timer = null;
    const keys = pendingKeys;

    pendingKeys = [];
    pendingSet.clear();
    if (keys.length > 0) {
      callback(keys);
    }
  }

  function destroy() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingKeys = [];
    pendingSet.clear();
  }

  return { add, flush, destroy };
}
