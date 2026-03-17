"use client";

import { AvatarProvider } from "@/contexts/AvatarContext";
import { RepoCaProvider } from "@/contexts/RepoCaContext";
import { MissionProvider } from "@/contexts/MissionContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SeasonPassProvider } from "@/contexts/SeasonPassContext";
import { NewsProvider } from "@/contexts/NewsContext";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { RoleSelectModal } from "./RoleSelectModal";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import { ReactNode } from "react";

function AppContent({ children }: { children: ReactNode }) {
  const { role } = useRole();
  return (
    <>
      <RoleSelectModal />
      <AppHeader />
      <div className="page-content">
        {children}
      </div>
      <BottomNav showAdmin={role === "admin"} />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <ProjectProvider>
        <AvatarProvider>
          <RepoCaProvider>
            <MissionProvider>
              <SeasonPassProvider>
                <NewsProvider>
                  <AppContent>{children}</AppContent>
                </NewsProvider>
              </SeasonPassProvider>
            </MissionProvider>
          </RepoCaProvider>
        </AvatarProvider>
      </ProjectProvider>
    </RoleProvider>
  );
}
