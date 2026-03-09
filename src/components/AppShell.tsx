"use client";

import { AvatarProvider } from "@/contexts/AvatarContext";
import { RepoCaProvider } from "@/contexts/RepoCaContext";
import { MissionProvider } from "@/contexts/MissionContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SeasonPassProvider } from "@/contexts/SeasonPassContext";
import AppHeader from "./AppHeader";
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ProjectProvider>
      <AvatarProvider>
        <RepoCaProvider>
          <MissionProvider>
            <SeasonPassProvider>
              <AppHeader />
              <div className="page-content">
                {children}
              </div>
            </SeasonPassProvider>
          </MissionProvider>
        </RepoCaProvider>
      </AvatarProvider>
    </ProjectProvider>
  );
}
