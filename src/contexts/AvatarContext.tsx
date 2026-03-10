"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import type { HeadCostume, BodyCostume, OmamorType } from "@/components/AvatarWithCostume";

interface AvatarContextValue {
  avatarKey: string;
  setAvatarKey: (key: string) => void;
  headCostume: HeadCostume;
  setHeadCostume: (v: HeadCostume) => void;
  bodyCostume: BodyCostume;
  setBodyCostume: (v: BodyCostume) => void;
  omamori: OmamorType;
  setOmamori: (v: OmamorType) => void;
}

const AvatarContext = createContext<AvatarContextValue>({
  avatarKey: currentUser.avatar,
  setAvatarKey: () => {},
  headCostume: null,
  setHeadCostume: () => {},
  bodyCostume: null,
  setBodyCostume: () => {},
  omamori: null,
  setOmamori: () => {},
});

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarKey, setAvatarKey]       = useState(currentUser.avatar);
  const [headCostume, setHeadCostume]   = useState<HeadCostume>(null);
  const [bodyCostume, setBodyCostume]   = useState<BodyCostume>(null);
  const [omamori, setOmamori]           = useState<OmamorType>(null);
  return (
    <AvatarContext.Provider value={{ avatarKey, setAvatarKey, headCostume, setHeadCostume, bodyCostume, setBodyCostume, omamori, setOmamori }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  return useContext(AvatarContext);
}
