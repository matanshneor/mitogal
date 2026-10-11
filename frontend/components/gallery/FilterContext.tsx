"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Shares the selected gallery category between the Services grid and the
 * Portfolio section, which are siblings on the landing page.
 *
 * This is what makes "tap חתונות → the gallery scrolls into view already
 * filtered" work without a page navigation.
 */
type FilterContextValue = {
  category: string;
  /** Sets the filter and scrolls the gallery into view. */
  selectAndScroll: (slug: string) => void;
  setCategory: (slug: string) => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function GalleryFilterProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState("all");

  const selectAndScroll = useCallback((slug: string) => {
    setCategory(slug);
    document
      .getElementById("portfolio")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = useMemo(
    () => ({ category, setCategory, selectAndScroll }),
    [category, selectAndScroll]
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useGalleryFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useGalleryFilter must be used inside GalleryFilterProvider");
  }
  return ctx;
}
