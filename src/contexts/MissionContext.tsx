"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Mission } from "@/types";
import { missions as initialMissions } from "@/lib/mock-data";

interface MissionContextValue {
  missions: Mission[];
  toggleMission: (id: string) => void;
  addMission: (m: Omit<Mission, "id">) => void;
}

const MissionContext = createContext<MissionContextValue>({
  missions: [],
  toggleMission: () => {},
  addMission: () => {},
});

export function MissionProvider({ children }: { children: ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([...initialMissions]);

  const toggleMission = (id: string) =>
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );

  const addMission = (m: Omit<Mission, "id">) =>
    setMissions((prev) => [
      ...prev,
      { ...m, id: `m_${Date.now()}`, progress: 0, completed: false },
    ]);

  return (
    <MissionContext.Provider value={{ missions, toggleMission, addMission }}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  return useContext(MissionContext);
}
