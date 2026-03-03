"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";

interface AvatarContextValue {
  avatarKey: string;
  setAvatarKey: (key: string) => void;
}

const AvatarContext = createContext<AvatarContextValue>({
  avatarKey: currentUser.avatar,
  setAvatarKey: () => {},
});

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarKey, setAvatarKey] = useState(currentUser.avatar);
  return (
    <AvatarContext.Provider value={{ avatarKey, setAvatarKey }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  return useContext(AvatarContext);
}
