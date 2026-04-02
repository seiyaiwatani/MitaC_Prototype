"use client";

import { useState } from "react";
import Link from "next/link";
import { useMission } from "@/contexts/MissionContext";
import { HiArrowLeft } from "react-icons/hi";
import type { Mission } from "@/types";

const TABS: { key: Mission["type"]; label: string; accent: string; desc: string }[] = [
  { key: "daily",     label: "デイリー",     accent: "#007aff", desc: "毎日リセット" },
  { key: "monthly",   label: "今月",         accent: "#10b981", desc: "月末リセット" },
  { key: "unlimited", label: "無期限",       accent: "#f59e0b", desc: "達成まで継続" },
];

export default function MissionsPage() {
  const { missions } = useMission();
  const [activeTab, setActiveTab] = useState<Mission["type"]>("daily");

  const items      = missions.filter((m) => m.type === activeTab);
  const doneCount  = items.filter((m) => m.completed).length;
  const totalCount = missions.filter((m) => m.completed).length;
  const accent     = TABS.find((t) => t.key === activeTab)!.accent;

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/" style={{ color: "#003878", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>ミッション</span>
        <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 600, color: "#6b7280" }}>
          達成: {totalCount}/{missions.length}
        </span>
      </div>

      {/* タブバー */}
      <div style={{
        flexShrink: 0, display: "flex", background: "white",
        borderBottom: "1px solid #e5e7eb", padding: "0 12px",
      }}>
        {TABS.map((tab) => {
          const cnt = missions.filter((m) => m.type === tab.key && m.completed).length;
          const tot = missions.filter((m) => m.type === tab.key).length;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "10px 4px 8px", background: "none", border: "none", cursor: "pointer",
                borderBottom: active ? `2px solid ${tab.accent}` : "2px solid transparent",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: active ? tab.accent : "#9ca3af" }}>
                {tab.label}
              </span>
              <span style={{ fontSize: 14, color: active ? tab.accent : "#9ca3af" }}>
                {cnt}/{tot}
              </span>
            </button>
          );
        })}
      </div>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: "16px 20px", gap: 16, overflowY: "auto" }}>

        {/* 達成状況サマリー */}
        <div style={{
          flexShrink: 0, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 16,
          background: "white", borderRadius: 10, padding: "8px 16px",
          border: `1px solid ${accent}`,
        }}>
          <span style={{ fontSize: 14, color: accent, fontWeight: 700 }}>
            {TABS.find((t) => t.key === activeTab)!.desc}
          </span>
          <span style={{ fontSize: 14, color: accent, fontWeight: 800 }}>
            {doneCount}/{items.length} 達成
          </span>
        </div>

        {/* ミッションカード */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af" }}>
              <p style={{ fontSize: 14 }}>ミッションはありません</p>
            </div>
          ) : items.map((m) => {
            const pct  = Math.min(Math.round((m.progress / m.goal) * 100), 100);
            const done = pct >= 100;
            return (
              <div
                key={m.id}
                className="card"
                style={{
                  padding: "12px 14px",
                  borderLeft: `4px solid ${done ? "#10b981" : accent}`,
                  opacity: done ? 0.85 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700, color: done ? "#9ca3af" : "#1a1a2e",
                        textDecoration: done ? "line-through" : "none",
                      }}>{m.title}</span>
                      {done && (
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#065f46", background: "#dcfce7", padding: "1px 8px", borderRadius: 99 }}>
                          達成！
                        </span>
                      )}
                    </div>
                    <p style={{
                      fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.4,
                      textDecoration: done ? "line-through" : "none",
                    }}>{m.description}</p>
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: 12, display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                    <div style={{
                      background: "#fff7ed", color: "#ea580c",
                      fontWeight: 800, fontSize: 14,
                      padding: "3px 10px", borderRadius: 99,
                      whiteSpace: "nowrap",
                    }}>
                      +{m.reward} XP
                    </div>
                    {m.passExpReward && (
                      <div style={{
                        background: "#eff6ff", color: "#1e40af",
                        fontWeight: 700, fontSize: 14,
                        padding: "2px 8px", borderRadius: 99,
                        whiteSpace: "nowrap",
                      }}>
                        +{m.passExpReward} PXP
                      </div>
                    )}
                  </div>
                </div>

                {/* プログレスバー */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 30 }}>
                  <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 4,
                      background: done
                        ? "linear-gradient(90deg,#10b981,#059669)"
                        : `linear-gradient(90deg,${accent},${accent}cc)`,
                      transition: "width 0.3s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 14, color: "#6b7280", whiteSpace: "nowrap", fontWeight: 600 }}>
                    {m.progress}/{m.goal}
                  </span>
                  <span style={{ fontSize: 14, color: done ? "#10b981" : accent, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
