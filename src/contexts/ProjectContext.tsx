"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Project } from "@/types";
import { projects as initialProjects } from "@/lib/mock-data";

interface ProjectContextValue {
  projects: Project[];
  addProject: (name: string, color?: string, textColor?: string, teamId?: string) => void;
}

const ProjectContext = createContext<ProjectContextValue>({
  projects: initialProjects,
  addProject: () => {},
});

const PALETTE: { color: string; textColor: string }[] = [
  { color: "#bbf7d0", textColor: "#065f46" },
  { color: "#bfdbfe", textColor: "#1e3a8a" },
  { color: "#e9d5ff", textColor: "#581c87" },
  { color: "#fde68a", textColor: "#78350f" },
  { color: "#fecaca", textColor: "#7f1d1d" },
  { color: "#d1fae5", textColor: "#064e3b" },
];

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const addProject = (name: string, color?: string, textColor?: string, teamId: string = "t1") => {
    const palette = PALETTE[projects.length % PALETTE.length];
    setProjects((prev) => [
      ...prev,
      {
        id: `p${Date.now()}`, name, teamId, icon: "📁",
        color:     color     ?? palette.color,
        textColor: textColor ?? palette.textColor,
      },
    ]);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  return useContext(ProjectContext);
}
