"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SeasonPass, SeasonReward } from "@/types";
import { seasonPass as initialData } from "@/lib/mock-data";

interface SeasonPassContextValue {
  passLevel: number;
  passExp: number;
  passExpToNext: number;
  maxPassLevel: number;
  seasonName: string;
  endDate: string;
  rewards: SeasonReward[];
  addPassExp: (amount: number) => void;
  claimReward: (level: number) => void;
}

const SeasonPassContext = createContext<SeasonPassContextValue>({
  passLevel: 1,
  passExp: 0,
  passExpToNext: 500,
  maxPassLevel: 50,
  seasonName: "",
  endDate: "",
  rewards: [],
  addPassExp: () => {},
  claimReward: () => {},
});

export function SeasonPassProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SeasonPass>({ ...initialData, rewards: [...initialData.rewards] });

  const addPassExp = (amount: number) => {
    setData((prev) => {
      const newExp = prev.passExp + amount;
      if (newExp >= prev.passExpToNext) {
        return { ...prev, passLevel: prev.passLevel + 1, passExp: newExp - prev.passExpToNext };
      }
      return { ...prev, passExp: newExp };
    });
  };

  const claimReward = (level: number) => {
    setData((prev) => ({
      ...prev,
      rewards: prev.rewards.map((r) => (r.level === level ? { ...r, claimed: true } : r)),
    }));
  };

  return (
    <SeasonPassContext.Provider
      value={{
        passLevel: data.passLevel,
        passExp: data.passExp,
        passExpToNext: data.passExpToNext,
        maxPassLevel: data.maxPassLevel,
        seasonName: data.seasonName,
        endDate: data.endDate,
        rewards: data.rewards,
        addPassExp,
        claimReward,
      }}
    >
      {children}
    </SeasonPassContext.Provider>
  );
}

export function useSeasonPass() {
  return useContext(SeasonPassContext);
}
