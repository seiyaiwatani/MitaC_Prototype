"use client";

import Link from "next/link";
import { missions } from "@/lib/mock-data";
import { HiArrowLeft, HiCalendar, HiClock, HiInformationCircle } from "react-icons/hi";

const GROUPS = [
  { type: "daily",     label: "デイリー",   accent: "#4f46e5", Icon: HiCalendar,         desc: "毎日リセット" },
  { type: "monthly",   label: "今月のミッション", accent: "#10b981", Icon: HiClock,            desc: "月末リセット" },
  { type: "unlimited", label: "無期限",     accent: "#f59e0b", Icon: HiInformationCircle, desc: "達成まで継続" },
] as const;

export default function MissionsPage() {
  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/mypage" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>ミッション</span>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
          達成: {missions.filter((m) => m.completed).length}/{missions.length}
        </span>
      </div>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 10, gap: 12, overflowY: "auto" }}>
        {GROUPS.map(({ type, label, accent, Icon, desc }) => {
          const items = missions.filter((m) => m.type === type);
          return (
            <div key={type}>
              {/* グループ見出し */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                marginBottom: 8,
              }}>
                <Icon style={{ width: 15, height: 15, color: accent }} />
                <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e" }}>{label}</span>
                <span style={{
                  fontSize: 10, color: accent, fontWeight: 600,
                  background: `${accent}18`, padding: "1px 8px", borderRadius: 99,
                }}>
                  {desc}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
                  {items.filter((m) => m.completed).length}/{items.length} 達成
                </span>
              </div>

              {/* ミッションカード列 */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((m) => {
                  const pct = Math.min(Math.round((m.progress / m.goal) * 100), 100);
                  const done = pct >= 100;
                  return (
                    <div key={m.id} className="card" style={{
                      padding: "12px 14px",
                      borderLeft: `4px solid ${done ? "#10b981" : accent}`,
                      opacity: done ? 0.85 : 1,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{m.title}</span>
                            {done && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, color: "#065f46",
                                background: "#dcfce7", padding: "1px 8px", borderRadius: 99,
                              }}>
                                達成！
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: "#6b7280", margin: 0, lineHeight: 1.4 }}>{m.description}</p>
                        </div>
                        <div style={{
                          flexShrink: 0, marginLeft: 12,
                          background: "#fef9c3", color: "#78350f",
                          fontWeight: 800, fontSize: 13,
                          padding: "4px 12px", borderRadius: 99,
                        }}>
                          +{m.reward} XP
                        </div>
                      </div>

                      {/* プログレスバー */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{
                            width: `${pct}%`, height: "100%", borderRadius: 4,
                            background: done
                              ? "linear-gradient(90deg,#10b981,#059669)"
                              : `linear-gradient(90deg,${accent},${accent}cc)`,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", fontWeight: 600 }}>
                          {m.progress} / {m.goal}
                        </span>
                        <span style={{ fontSize: 11, color: done ? "#10b981" : accent, fontWeight: 700, whiteSpace: "nowrap" }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
