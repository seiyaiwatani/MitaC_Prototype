"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { RepoCa } from "@/types";
import { repoCas, todaySelectedIds } from "@/lib/mock-data";

interface RepoCaContextValue {
  todayRepoCas: RepoCa[];
  addTodayRepoCa: (rc: RepoCa) => void;
  toggleTodayRepoCa: (id: string) => void;
}

const RepoCaContext = createContext<RepoCaContextValue>({
  todayRepoCas: [],
  addTodayRepoCa: () => {},
  toggleTodayRepoCa: () => {},
});

export function RepoCaProvider({ children }: { children: ReactNode }) {
  const [todayRepoCas, setTodayRepoCas] = useState<RepoCa[]>(
    repoCas.filter((r) => todaySelectedIds.includes(r.id))
  );
  const addTodayRepoCa = (rc: RepoCa) =>
    setTodayRepoCas((prev) => [...prev, rc]);
  const toggleTodayRepoCa = (id: string) =>
    setTodayRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));

  return (
    <RepoCaContext.Provider value={{ todayRepoCas, addTodayRepoCa, toggleTodayRepoCa }}>
      {children}
    </RepoCaContext.Provider>
  );
}

export function useRepoCa() {
  return useContext(RepoCaContext);
}
