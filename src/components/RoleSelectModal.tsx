"use client";

import { useRole } from "@/contexts/RoleContext";

export function RoleSelectModal() {
  const { role, setRole } = useRole();

  if (role !== null) return null;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.65)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "32px 24px",
        width: "100%",
        maxWidth: 320,
        textAlign: "center",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
        <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", margin: "0 0 6px" }}>
          Mita=C へようこそ
        </p>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.6 }}>
          アクセス種別を選択してください
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => setRole("user")}
            style={{
              padding: "14px 0", borderRadius: 12,
              border: "2px solid #4f46e5",
              background: "#4f46e5", color: "white",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            👤 一般
          </button>
          <button
            onClick={() => setRole("admin")}
            style={{
              padding: "14px 0", borderRadius: 12,
              border: "2px solid #e5e7eb",
              background: "white", color: "#374151",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            🔧 管理者
          </button>
        </div>
      </div>
    </div>
  );
}
