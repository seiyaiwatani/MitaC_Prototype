"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { RepoCa } from "@/types";
import { repoCas as defaultRepoCas, todaySelectedIds } from "@/lib/mock-data";

const LS_KEY_REPOCAS = "mitac_repocas";

function loadRepoCas(): RepoCa[] {
  if (typeof window === "undefined") return defaultRepoCas;
  try {
    const raw = localStorage.getItem(LS_KEY_REPOCAS);
    if (raw) return JSON.parse(raw) as RepoCa[];
  } catch {}
  return defaultRepoCas;
}

function saveRepoCas(list: RepoCa[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY_REPOCAS, JSON.stringify(list));
}

interface RepoCaContextValue {
  allRepoCas: RepoCa[];
  updateRepoCa: (id: string, patch: Partial<RepoCa>) => void;
  addRepoCa: (rc: RepoCa) => void;
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
  startReportedDate: string | null;
  setStartReportedDate: (v: string | null) => void;
  overtimeReportedDate: string | null;
  setOvertimeReportedDate: (v: string | null) => void;
  endReportedDate: string | null;
  setEndReportedDate: (v: string | null) => void;
}

const RepoCaContext = createContext<RepoCaContextValue>({
  allRepoCas: defaultRepoCas,
  updateRepoCa: () => {},
  addRepoCa: () => {},
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
  startReportedDate: null,
  setStartReportedDate: () => {},
  overtimeReportedDate: null,
  setOvertimeReportedDate: () => {},
  endReportedDate: null,
  setEndReportedDate: () => {},
});

export function RepoCaProvider({ children }: { children: ReactNode }) {
  const [allRepoCas, setAllRepoCas] = useState<RepoCa[]>(defaultRepoCas);
  const [hydrated, setHydrated] = useState(false);

  // localStorage から読み込み（クライアントのみ）
  useEffect(() => {
    setAllRepoCas(loadRepoCas());
    setHydrated(true);
  }, []);

  // allRepoCas が変更されたら localStorage に保存
  useEffect(() => {
    if (hydrated) saveRepoCas(allRepoCas);
  }, [allRepoCas, hydrated]);

  const updateRepoCa = (id: string, patch: Partial<RepoCa>) =>
    setAllRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));

  const addRepoCa = (rc: RepoCa) =>
    setAllRepoCas((prev) => [...prev, rc]);

  const [todayRepoCas, setTodayRepoCas] = useState<RepoCa[]>(
    defaultRepoCas.filter((r) => todaySelectedIds.includes(r.id))
  );
  const [hasStartReported, setHasStartReported] = useState(false);
  const [hasOvertimeReported, setHasOvertimeReported] = useState(false);
  const [hasEndReported, setHasEndReported] = useState(false);
  const [startReportedDate, setStartReportedDate] = useState<string | null>(null);
  const [overtimeReportedDate, setOvertimeReportedDate] = useState<string | null>(null);
  const [endReportedDate, setEndReportedDate] = useState<string | null>(null);
  const resetDailyReports = () => {
    setHasStartReported(false);
    setHasOvertimeReported(false);
    setHasEndReported(false);
  };
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    defaultRepoCas.filter((r) => r.isFavorite).map((r) => r.id)
  );

  const addTodayRepoCa = (rc: RepoCa) =>
    setTodayRepoCas((prev) => [...prev, rc]);
  const toggleTodayRepoCa = (id: string) =>
    setTodayRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
  const toggleFavorite = (id: string) =>
    setFavoriteIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const setTodayFromIds = (ids: string[]) =>
    setTodayRepoCas(allRepoCas.filter((r) => ids.includes(r.id)));

  return (
    <RepoCaContext.Provider value={{
      allRepoCas, updateRepoCa, addRepoCa,
      todayRepoCas, addTodayRepoCa, toggleTodayRepoCa,
      hasStartReported, hasOvertimeReported, hasEndReported,
      setHasStartReported, setHasOvertimeReported, setHasEndReported, resetDailyReports,
      favoriteIds, toggleFavorite, setTodayFromIds,
      startReportedDate, setStartReportedDate,
      overtimeReportedDate, setOvertimeReportedDate,
      endReportedDate, setEndReportedDate,
    }}>
      {children}
    </RepoCaContext.Provider>
  );
}

export function useRepoCa() {
  return useContext(RepoCaContext);
}
