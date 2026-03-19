"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "admin" | "user" | null;

interface RoleContextValue {
  role: Role;
  setRole: (r: "admin" | "user") => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextValue>({ role: null, setRole: () => {}, clearRole: () => {} });

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("mitac_role");
    if (saved === "admin" || saved === "user") return saved;
    return null;
  });

  const setRole = (r: "admin" | "user") => {
    localStorage.setItem("mitac_role", r);
    setRoleState(r);
  };

  const clearRole = () => {
    localStorage.removeItem("mitac_role");
    setRoleState(null);
  };

  return <RoleContext.Provider value={{ role, setRole, clearRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
