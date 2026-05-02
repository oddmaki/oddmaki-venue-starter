"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const progressRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateProgress = (next: number | null) => {
    progressRef.current = next;
    setProgress(next);
  };

  const clearTimers = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  };

  const finish = () => {
    if (progressRef.current === null) return;
    clearTimers();
    updateProgress(100);
    hideRef.current = setTimeout(() => updateProgress(null), 250);
  };

  useEffect(() => {
    finish();
  }, [pathname, searchParams]);

  useEffect(() => {
    const start = () => {
      clearTimers();
      updateProgress(10);
      tickRef.current = setInterval(() => {
        const current = progressRef.current;

        if (current === null || current >= 90) return;
        updateProgress(current + (90 - current) * 0.15);
      }, 200);
      safetyRef.current = setTimeout(finish, 10000);
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");

      if (!anchor) return;

      const targetAttr = anchor.getAttribute("target");

      if (targetAttr && targetAttr !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      let url: URL;

      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      clearTimers();
    };
  }, []);

  if (progress === null) return null;

  const isComplete = progress >= 100;

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
    >
      <div
        className="h-full bg-primary text-primary shadow-[0_0_10px_currentColor,0_0_4px_currentColor]"
        style={{
          width: `${progress}%`,
          opacity: isComplete ? 0 : 1,
          transition: isComplete
            ? "width 200ms ease-out, opacity 250ms ease-out 150ms"
            : "width 200ms ease-out",
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
