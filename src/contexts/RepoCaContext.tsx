"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { RepoCa } from "@/types";
import { repoCas, todaySelectedIds } from "@/lib/mock-data";

interface RepoCaContextValue {
  todayRepoCas: RepoCa[];
  addTodayRepoCa: (rc: RepoCa) => void;
  toggleTodayRepoCa: (id: string) => void;
  hasStartReported: boolean;
  hasOvertimeReported: boolean;
  hasEndReported: boolean;
  setHasStartReported: (v: boolean) => void;
  setHasOvertimeReported: (v: boolean) => void;
  setHasEndReported: (v: boolean) => void;
  resetDailyReports: () => void;
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  setTodayFromIds: (ids: string[]) => void;
}

const RepoCaContext = createContext<RepoCaContextValue>({
  todayRepoCas: [],
  addTodayRepoCa: () => {},
  toggleTodayRepoCa: () => {},
  hasStartReported: false,
  hasOvertimeReported: false,
  hasEndReported: false,
  setHasStartReported: () => {},
  setHasOvertimeReported: () => {},
  setHasEndReported: () => {},
  resetDailyReports: () => {},
  favoriteIds: [],
  toggleFavorite: () => {},
  setTodayFromIds: () => {},
});

export function RepoCaProvider({ children }: { children: ReactNode }) {
  const [todayRepoCas, setTodayRepoCas] = useState<RepoCa[]>(
    repoCas.filter((r) => todaySelectedIds.includes(r.id))
  );
  const [hasStartReported, setHasStartReported] = useState(false);
  const [hasOvertimeReported, setHasOvertimeReported] = useState(false);
  const [hasEndReported, setHasEndReported] = useState(false);
  const resetDailyReports = () => {
    setHasStartReported(false);
    setHasOvertimeReported(false);
    setHasEndReported(false);
  };
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    repoCas.filter((r) => r.isFavorite).map((r) => r.id)
  );

  const addTodayRepoCa = (rc: RepoCa) =>
    setTodayRepoCas((prev) => [...prev, rc]);
  const toggleTodayRepoCa = (id: string) =>
    setTodayRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  const toggleFavorite = (id: string) =>
    setFavoriteIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const setTodayFromIds = (ids: string[]) =>
    setTodayRepoCas(repoCas.filter((r) => ids.includes(r.id)));

  return (
    <RepoCaContext.Provider value={{
      todayRepoCas, addTodayRepoCa, toggleTodayRepoCa,
      hasStartReported, hasOvertimeReported, hasEndReported,
      setHasStartReported, setHasOvertimeReported, setHasEndReported, resetDailyReports,
      favoriteIds, toggleFavorite, setTodayFromIds,
    }}>
      {children}
    </RepoCaContext.Provider>
  );
}

export function useRepoCa() {
  return useContext(RepoCaContext);
}
