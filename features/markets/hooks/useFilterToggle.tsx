"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface FilterToggleContextType {
  showFilters: boolean;
  toggleFilters: () => void;
}

const FilterToggleContext = createContext<FilterToggleContextType>({
  showFilters: false,
  toggleFilters: () => {},
});

export function useFilterToggle() {
  return useContext(FilterToggleContext);
}

export function FilterToggleProvider({ children }: { children: ReactNode }) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <FilterToggleContext.Provider
      value={{ showFilters, toggleFilters: () => setShowFilters((v) => !v) }}
    >
      {children}
    </FilterToggleContext.Provider>
  );
}
