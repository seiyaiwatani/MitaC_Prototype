"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import type { HeadCostume, BodyCostume } from "@/components/AvatarWithCostume";

interface AvatarContextValue {
  avatarKey: string;
  setAvatarKey: (key: string) => void;
  headCostume: HeadCostume;
  setHeadCostume: (v: HeadCostume) => void;
  bodyCostume: BodyCostume;
  setBodyCostume: (v: BodyCostume) => void;
}

const AvatarContext = createContext<AvatarContextValue>({
  avatarKey: currentUser.avatar,
  setAvatarKey: () => {},
  headCostume: null,
  setHeadCostume: () => {},
  bodyCostume: null,
  setBodyCostume: () => {},
});

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarKey, setAvatarKey]       = useState(currentUser.avatar);
  const [headCostume, setHeadCostume]   = useState<HeadCostume>(null);
  const [bodyCostume, setBodyCostume]   = useState<BodyCostume>(null);
  return (
    <AvatarContext.Provider value={{ avatarKey, setAvatarKey, headCostume, setHeadCostume, bodyCostume, setBodyCostume }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  return useContext(AvatarContext);
}
