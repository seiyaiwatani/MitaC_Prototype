"use client";

import { AvatarProvider } from "@/contexts/AvatarContext";
import { RepoCaProvider } from "@/contexts/RepoCaContext";
import AppHeader from "./AppHeader";
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AvatarProvider>
      <RepoCaProvider>
        <AppHeader />
        <div className="page-content">
          {children}
        </div>
      </RepoCaProvider>
    </AvatarProvider>
  );
}
