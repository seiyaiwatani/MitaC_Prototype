"use client";

import { useState } from "react";
import { projects } from "@/lib/mock-data";

/* ── モックデータ ── */
const TEAM_MEMBERS = [
  { id: "m1", name: "田中 太郎", reported: true },
  { id: "m2", name: "鈴木 花子", reported: true },
  { id: "m3", name: "佐藤 健",   reported: false },
  { id: "m4", name: "山田 優",   reported: true },
  { id: "m5", name: "伊藤 舞",   reported: true },
];

const PROJ_COLOR: Record<string, string> = {
  p1: "#4f46e5", p2: "#10b981", p3: "#f59e0b", p4: "#ef4444",
};

// 日別工数: メンバー × [プロジェクト, 分]
const DAILY_WORK: Record<string, { projectId: string; min: number }[]> = {
  m1: [{ projectId: "p1", min: 240 }, { projectId: "p2", min: 120 }],
  m2: [{ projectId: "p1", min: 180 }, { projectId: "p3", min: 180 }],
  m3: [{ projectId: "p2", min: 300 }, { projectId: "p4", min: 60  }],
  m4: [{ projectId: "p4", min: 240 }],
  m5: [{ projectId: "p1", min: 120 }, { projectId: "p2", min: 120 }, { projectId: "p3", min: 60 }],
};

// 月別稼働: メンバー × 日(1-24), true=稼働
const MONTHLY_WORK: Record<string, boolean[]> = {
  m1: Array.from({ length: 24 }, (_, i) => i % 7 < 5),
  m2: Array.from({ length: 24 }, (_, i) => i % 7 < 5 && i !== 10),
  m3: Array.from({ length: 24 }, (_, i) => i % 7 < 5 && i > 2),
  m4: Array.from({ length: 24 }, (_, i) => i % 7 < 5),
  m5: Array.from({ length: 24 }, (_, i) => i % 7 < 5 && i !== 15),
};

type View = "projects" | "daily" | "monthly" | "new-project";

const NAV_ITEMS: { key: View; label: string; icon: string }[] = [
  { key: "projects",    label: "プロジェクト一覧", icon: "📁" },
  { key: "daily",       label: "工数管理/日",      icon: "📊" },
  { key: "monthly",     label: "工数管理/月",      icon: "📅" },
  { key: "new-project", label: "プロジェクト作成", icon: "➕" },
];

export default function AdminPage() {
  const [view, setView]           = useState<View>("projects");
  const [search, setSearch]       = useState("");
  const [projName, setProjName]   = useState("");
  const [projMemo, setProjMemo]   = useState("");

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
        background: "#1e1b4b", color: "white",
      }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>🔧 管理者</span>
        <span style={{ marginLeft: "auto", fontSize: 11, opacity: 0.7 }}>
          {NAV_ITEMS.find((n) => n.key === view)?.label}
        </span>
      </header>

      {/* サイドバー＋コンテンツ */}
      <div className="page-body admin-layout">

        {/* サイドバー */}
        <div className="admin-sidebar">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              className={`admin-nav-item ${view === n.key ? "active" : ""}`}
              style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}
              onClick={() => setView(n.key)}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className="admin-content">

          {/* ── プロジェクト一覧 ── */}
          {view === "projects" && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="プロジェクト検索..."
                  style={{
                    flex: 1, border: "1px solid #e5e7eb", borderRadius: 6,
                    padding: "5px 10px", fontSize: 12,
                  }}
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 11, padding: "5px 14px", whiteSpace: "nowrap" }}
                  onClick={() => setView("new-project")}
                >
                  + 登録
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {projects
                  .filter((p) => p.name.includes(search))
                  .map((p) => (
                    <div key={p.id} className="card" style={{
                      padding: "10px 12px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: PROJ_COLOR[p.id] ?? "#6b7280" }} />
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#6b7280", marginTop: 3, marginLeft: 16 }}>
                          チームID: {p.teamId} ｜ 進行中
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost" style={{ fontSize: 10, padding: "3px 10px" }}>編集</button>
                        <button className="btn btn-danger" style={{ fontSize: 10, padding: "3px 10px" }}>削除</button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* ── 工数管理/日 ── */}
          {view === "daily" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>工数管理 / 日 — 2026/02/24</div>

              {/* 凡例 */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                {projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: PROJ_COLOR[p.id] }} />
                    <span style={{ color: "#4b5563" }}>{p.name}</span>
                  </div>
                ))}
              </div>

              {/* バーチャート */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TEAM_MEMBERS.map((m) => {
                  const segs  = DAILY_WORK[m.id] ?? [];
                  const total = segs.reduce((s, x) => s + x.min, 0);
                  const maxMin = 480;
                  return (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* 名前 */}
                      <div style={{ width: 60, fontSize: 11, color: "#374151", flexShrink: 0, textAlign: "right" }}>
                        {m.name.split(" ")[0]}
                      </div>
                      {/* バー */}
                      <div style={{
                        flex: 1, height: 22, background: "#f3f4f6",
                        borderRadius: 4, overflow: "hidden", display: "flex",
                      }}>
                        {segs.map((seg, i) => (
                          <div
                            key={i}
                            title={`${projects.find((p) => p.id === seg.projectId)?.name}: ${seg.min / 60}h`}
                            style={{
                              width: `${(seg.min / maxMin) * 100}%`,
                              background: PROJ_COLOR[seg.projectId],
                              borderRight: i < segs.length - 1 ? "1px solid rgba(255,255,255,0.4)" : "none",
                            }}
                          />
                        ))}
                      </div>
                      {/* 合計 */}
                      <span style={{ fontSize: 10, color: "#6b7280", width: 28, flexShrink: 0, textAlign: "right" }}>
                        {(total / 60).toFixed(1)}h
                      </span>
                      {/* 報告ステータス */}
                      <span style={{
                        fontSize: 10, fontWeight: 700, width: 36, flexShrink: 0,
                        color: m.reported ? "#10b981" : "#ef4444",
                      }}>
                        {m.reported ? "報告済" : "未報告"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 8h目盛り */}
              <div style={{ marginTop: 8, paddingLeft: 68, display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af" }}>
                <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
              </div>
            </>
          )}

          {/* ── 工数管理/月 ── */}
          {view === "monthly" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>工数管理 / 月 — 2026年2月</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", fontSize: 10, width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ width: 60, padding: "4px 6px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 700, color: "#374151" }}>
                        氏名
                      </th>
                      {Array.from({ length: 24 }, (_, i) => (
                        <th key={i} style={{
                          padding: "4px 1px", textAlign: "center",
                          borderBottom: "1px solid #e5e7eb",
                          color: "#6b7280", fontWeight: 600, minWidth: 18,
                        }}>
                          {i + 1}
                        </th>
                      ))}
                      <th style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #e5e7eb", fontWeight: 700, color: "#374151" }}>
                        合計
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_MEMBERS.map((m) => {
                      const days  = MONTHLY_WORK[m.id] ?? [];
                      const total = days.filter(Boolean).length;
                      return (
                        <tr key={m.id}>
                          <td style={{ padding: "5px 6px", fontWeight: 600, color: "#374151", borderBottom: "1px solid #f3f4f6" }}>
                            {m.name.split(" ")[0]}
                          </td>
                          {days.map((worked, i) => (
                            <td key={i} style={{ padding: "4px 1px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                              <div style={{
                                width: 12, height: 12, borderRadius: 2, margin: "0 auto",
                                background: worked ? "#4f46e5" : "#e5e7eb",
                              }} />
                            </td>
                          ))}
                          <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 700, color: "#4f46e5", borderBottom: "1px solid #f3f4f6" }}>
                            {total}日
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── プロジェクト作成 ── */}
          {view === "new-project" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>プロジェクト作成</div>
              <div className="card" style={{ padding: 14, maxWidth: 380 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    プロジェクト名
                  </label>
                  <input
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="例: 社内基盤システム刷新"
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                    メモ
                  </label>
                  <textarea
                    value={projMemo}
                    onChange={(e) => setProjMemo(e.target.value)}
                    placeholder="プロジェクトの概要・備考"
                    rows={4}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12, resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => setView("projects")}>
                    キャンセル
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, fontSize: 12 }}
                    disabled={!projName.trim()}
                    onClick={() => {
                      alert(`「${projName}」を登録しました`);
                      setProjName(""); setProjMemo("");
                      setView("projects");
                    }}
                  >
                    登録
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
