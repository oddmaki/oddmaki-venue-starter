"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

import { AuthProvider } from "@/features/auth";
import { RealtimeProvider } from "@/features/realtime";
import { FilterToggleProvider } from "@/features/markets/hooks/useFilterToggle";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <RealtimeProvider>
        <HeroUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>
            <FilterToggleProvider>
              {children}
              <Toaster closeButton richColors position="bottom-right" />
            </FilterToggleProvider>
          </NextThemesProvider>
        </HeroUIProvider>
      </RealtimeProvider>
    </AuthProvider>
  );
}
