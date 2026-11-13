"use client";
import { createContext, useContext, useState } from "react";
import type { ProviderFilter } from "@/lib/search";

const Ctx = createContext<[ProviderFilter, (v: ProviderFilter) => void]>(["alle", () => {}]);

/** Teilt die Anbieterart zwischen Hero-Suche und «Beliebte Fahrzeuge». */
export function HomeFilterProvider({ children }: { children: React.ReactNode }) {
  const state = useState<ProviderFilter>("alle");
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
export const useHomeFilter = () => useContext(Ctx);
