"use client";

import { useState } from "react";
import { projects } from "@/lib/mock-data";
import {
  HiFolder, HiChartBar, HiCalendar, HiPlus, HiCog, HiX,
} from "react-icons/hi";

/* ── 型定義 ── */
type DailyTask = { name: string; min: number };
type DailySeg  = { projectId: string; min: number; tasks: DailyTask[] };

/* ── モックデータ ── */
const TEAM_MEMBERS = [
  { id: "m1", name: "田中 太郎", reported: true },
  { id: "m2", name: "鈴木 花子", reported: true },
  { id: "m3", name: "佐藤 健",   reported: false },
  { id: "m4", name: "山田 優",   reported: true },
  { id: "m5", name: "伊藤 舞",   reported: true },
];

const PROJ_COLOR: Record<string, string> = {
  p1: "#4f46e5", p2: "#10b981", p3: "#a855f7", p4: "#f59e0b",
};

const DAILY_WORK: Record<string, DailySeg[]> = {
  m1: [
    { projectId: "p1", min: 240, tasks: [
      { name: "Contactページ作成",         min: 120 },
      { name: "ヘッダーコンポーネント修正", min: 80 },
      { name: "デイリースクラム",           min: 40 },
    ]},
    { projectId: "p2", min: 120, tasks: [
      { name: "会社概要ページ修正",         min: 90 },
      { name: "定例MTG",                   min: 30 },
    ]},
  ],
  m2: [
    { projectId: "p1", min: 180, tasks: [
      { name: "stg環境インフラ構築",        min: 120 },
      { name: "レビュー対応",               min: 60 },
    ]},
    { projectId: "p3", min: 180, tasks: [
      { name: "モバイルTOP画面作成",        min: 150 },
      { name: "リファインメント",            min: 30 },
    ]},
  ],
  m3: [
    { projectId: "p2", min: 300, tasks: [
      { name: "トップページデザイン実装",   min: 180 },
      { name: "画像最適化",                 min: 60 },
      { name: "レスポンシブ対応",           min: 60 },
    ]},
    { projectId: "p4", min: 60, tasks: [
      { name: "DB設計レビュー",             min: 60 },
    ]},
  ],
  m4: [
    { projectId: "p4", min: 240, tasks: [
      { name: "ETLパイプライン設計",        min: 120 },
      { name: "データ検証スクリプト作成",   min: 90 },
      { name: "チームMTG",                 min: 30 },
    ]},
  ],
  m5: [
    { projectId: "p1", min: 120, tasks: [
      { name: "APIエンドポイント実装",      min: 90 },
      { name: "コードレビュー",             min: 30 },
    ]},
    { projectId: "p2", min: 120, tasks: [
      { name: "ブログ一覧ページ作成",       min: 120 },
    ]},
    { projectId: "p3", min: 60, tasks: [
      { name: "サブリーダー1on1",           min: 60 },
    ]},
  ],
};

const MONTHLY_WORK: Record<string, Record<string, number>> = {
  m1: { p1: 5760, p2: 1920 },
  m2: { p1: 4320, p3: 3840 },
  m3: { p2: 6720, p4: 960 },
  m4: { p4: 5760 },
  m5: { p1: 2880, p2: 2880, p3: 1440 },
};

type View = "projects" | "daily" | "monthly" | "new-project";

const NAV_ITEMS: { key: View; label: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> }[] = [
  { key: "projects",    label: "プロジェクト一覧", Icon: HiFolder },
  { key: "daily",       label: "工数管理/日",      Icon: HiChartBar },
  { key: "monthly",     label: "工数管理/月",      Icon: HiCalendar },
  { key: "new-project", label: "プロジェクト作成", Icon: HiPlus },
];

type TooltipState = {
  title: string;
  titleColor: string;
  rows: { label: string; value: string }[];
  total: string;
  x: number;
  y: number;
} | null;

type ModalState = {
  member: typeof TEAM_MEMBERS[number];
  mode: "daily" | "monthly";
} | null;

export default function AdminPage() {
  const [view, setView]         = useState<View>("projects");
  const [search, setSearch]     = useState("");
  const [projName, setProjName] = useState("");
  const [projMemo, setProjMemo] = useState("");

  const [hoveredKey, setHoveredKey]   = useState<string | null>(null);
  const [tooltip, setTooltip]         = useState<TooltipState>(null);
  const [modal, setModal]             = useState<ModalState>(null);

  const openModal = (member: typeof TEAM_MEMBERS[number], mode: "daily" | "monthly") =>
    setModal({ member, mode });
  const closeModal = () => setModal(null);

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
        background: "#1e1b4b", color: "white",
      }}>
        <HiCog style={{ width: 18, height: 18, opacity: 0.9 }} />
        <span style={{ fontWeight: 800, fontSize: 15 }}>管理者</span>
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
              <n.Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
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
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 10px", fontSize: 12 }}
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 11, padding: "5px 14px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}
                  onClick={() => setView("new-project")}
                >
                  <HiPlus style={{ width: 13, height: 13 }} /> 登録
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {projects.filter((p) => p.name.includes(search)).map((p) => (
                  <div key={p.id} className="card" style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {TEAM_MEMBERS.map((m) => {
                  const segs   = DAILY_WORK[m.id] ?? [];
                  const total  = segs.reduce((s, x) => s + x.min, 0);
                  const maxMin = 480;

                  return (
                    <div key={m.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* 名前クリック → モーダル */}
                        <div
                          onClick={() => openModal(m, "daily")}
                          style={{
                            width: 64, fontSize: 11, flexShrink: 0, textAlign: "right",
                            cursor: "pointer", userSelect: "none",
                            fontWeight: 600, color: "#4f46e5",
                            textDecoration: "underline", textDecorationStyle: "dotted",
                          }}
                        >
                          {m.name.split(" ")[0]}
                        </div>

                        {/* スタックバー */}
                        <div style={{ flex: 1, height: 24, background: "#f3f4f6", borderRadius: 4, display: "flex" }}>
                          {segs.map((seg, i) => {
                            const proj    = projects.find((p) => p.id === seg.projectId);
                            const key     = `daily_${m.id}_${i}`;
                            const hovered = hoveredKey === key;
                            return (
                              <div
                                key={i}
                                style={{
                                  width: `${(seg.min / maxMin) * 100}%`,
                                  background: PROJ_COLOR[seg.projectId],
                                  borderRight: i < segs.length - 1 ? "1px solid rgba(255,255,255,0.4)" : "none",
                                  borderRadius: i === 0 ? "4px 0 0 4px" : i === segs.length - 1 ? "0 4px 4px 0" : 0,
                                  cursor: "pointer",
                                  filter: hovered ? "brightness(1.25)" : "brightness(1)",
                                  transition: "filter 0.15s ease",
                                }}
                                onMouseEnter={(e) => {
                                  setHoveredKey(key);
                                  setTooltip({
                                    title: proj?.name ?? seg.projectId,
                                    titleColor: PROJ_COLOR[seg.projectId],
                                    rows: seg.tasks.map((t) => ({ label: t.name, value: `${t.min}分` })),
                                    total: `${seg.min}分（${(seg.min / 60).toFixed(1)}h）`,
                                    x: e.clientX,
                                    y: e.clientY,
                                  });
                                }}
                                onMouseMove={(e) => setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                                onMouseLeave={() => { setHoveredKey(null); setTooltip(null); }}
                              />
                            );
                          })}
                        </div>

                        <span style={{ fontSize: 10, color: "#6b7280", width: 28, flexShrink: 0, textAlign: "right" }}>
                          {(total / 60).toFixed(1)}h
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, width: 36, flexShrink: 0, color: m.reported ? "#10b981" : "#ef4444" }}>
                          {m.reported ? "報告済" : "未報告"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 8, paddingLeft: 72, display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af" }}>
                <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
              </div>
            </>
          )}

          {/* ── 工数管理/月 ── */}
          {view === "monthly" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>工数管理 / 月 — 2026年2月</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 12 }}>
                各メンバーの月合計工数をプロジェクト別に集計しています
              </div>

              {/* 凡例 */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                {projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: PROJ_COLOR[p.id] ?? "#6b7280", flexShrink: 0 }} />
                    <span style={{ color: "#374151" }}>{p.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {TEAM_MEMBERS.map((m) => {
                  const pjMap    = MONTHLY_WORK[m.id] ?? {};
                  const segs     = Object.entries(pjMap).map(([pid, min]) => ({ projectId: pid, min }));
                  const totalMin = segs.reduce((s, x) => s + x.min, 0);
                  const totalH   = (totalMin / 60).toFixed(1);
                  const maxMin   = 9600;

                  return (
                    <div key={m.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5 }}>
                        {/* 名前クリック → モーダル */}
                        <span
                          onClick={() => openModal(m, "monthly")}
                          style={{
                            fontSize: 12, fontWeight: 700, color: "#4f46e5",
                            cursor: "pointer", userSelect: "none",
                            textDecoration: "underline", textDecorationStyle: "dotted",
                          }}
                        >
                          {m.name}
                        </span>
                        <span style={{ fontSize: 11, color: "#6b7280" }}>
                          合計 <strong style={{ color: "#1a1a2e" }}>{totalH}h</strong>
                        </span>
                      </div>

                      {/* スタックバー */}
                      <div style={{ height: 26, display: "flex", borderRadius: 6, overflow: "hidden", background: "#f3f4f6" }}>
                        {segs.map((seg, i) => {
                          const proj    = projects.find((p) => p.id === seg.projectId);
                          const key     = `monthly_${m.id}_${i}`;
                          const hovered = hoveredKey === key;
                          const pct     = Math.round((seg.min / totalMin) * 100);
                          return (
                            <div
                              key={i}
                              style={{
                                width: `${(seg.min / maxMin) * 100}%`,
                                background: PROJ_COLOR[seg.projectId] ?? "#9ca3af",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                borderRight: i < segs.length - 1 ? "1px solid rgba(255,255,255,0.5)" : "none",
                                overflow: "hidden", cursor: "pointer",
                                filter: hovered ? "brightness(1.25)" : "brightness(1)",
                                transition: "filter 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                setHoveredKey(key);
                                setTooltip({
                                  title: proj?.name ?? seg.projectId,
                                  titleColor: PROJ_COLOR[seg.projectId],
                                  rows: [
                                    { label: "月間工数", value: `${(seg.min / 60).toFixed(1)}h` },
                                    { label: "全体比率", value: `${pct}%` },
                                  ],
                                  total: `${(seg.min / 60).toFixed(1)}h / ${totalH}h`,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              onMouseMove={(e) => setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => { setHoveredKey(null); setTooltip(null); }}
                            >
                              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", padding: "0 4px" }}>
                                {(seg.min / 60).toFixed(0)}h
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                        {segs.map((seg) => {
                          const proj = projects.find((p) => p.id === seg.projectId);
                          const pct  = Math.round((seg.min / totalMin) * 100);
                          return (
                            <span key={seg.projectId} style={{ fontSize: 9, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: PROJ_COLOR[seg.projectId], display: "inline-block" }} />
                              {proj?.name ?? seg.projectId}: {(seg.min / 60).toFixed(0)}h ({pct}%)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, borderTop: "1px solid #f3f4f6", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af" }}>
                <span>0h</span><span>40h</span><span>80h</span><span>120h</span><span>160h</span>
              </div>
            </>
          )}

          {/* ── プロジェクト作成 ── */}
          {view === "new-project" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>プロジェクト作成</div>
              <div className="card" style={{ padding: 14, maxWidth: 380 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>プロジェクト名</label>
                  <input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="例: 社内基盤システム刷新"
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>メモ</label>
                  <textarea value={projMemo} onChange={(e) => setProjMemo(e.target.value)} placeholder="プロジェクトの概要・備考" rows={4}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => setView("projects")}>キャンセル</button>
                  <button className="btn btn-primary" style={{ flex: 2, fontSize: 12 }} disabled={!projName.trim()}
                    onClick={() => { alert(`「${projName}」を登録しました`); setProjName(""); setProjMemo(""); setView("projects"); }}>
                    登録
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ホバーツールチップ */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x + 14, top: tooltip.y - 10,
          background: "white", border: "1px solid #e5e7eb", borderRadius: 8,
          padding: "10px 14px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          zIndex: 9999, fontSize: 11, minWidth: 180, pointerEvents: "none",
        }}>
          <div style={{ fontWeight: 700, color: tooltip.titleColor, marginBottom: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: tooltip.titleColor, display: "inline-block" }} />
            {tooltip.title}
          </div>
          {tooltip.rows.map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", gap: 16, padding: "2px 0",
              borderBottom: i < tooltip.rows.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <span style={{ color: "#374151" }}>{r.label}</span>
              <span style={{ color: "#9ca3af", whiteSpace: "nowrap" }}>{r.value}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 5, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: "#374151" }}>合計</span>
            <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{tooltip.total}</span>
          </div>
        </div>
      )}

      {/* モーダル */}
      {modal && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white", borderRadius: 14,
              padding: "24px 28px", width: 560, maxWidth: "90vw",
              maxHeight: "80vh", overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>{modal.member.name}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
                  {modal.mode === "daily" ? "2026/02/24 の工数詳細" : "2026年2月 の月次工数"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 99,
                  background: modal.member.reported ? "#dcfce7" : "#fee2e2",
                  color:      modal.member.reported ? "#166534"  : "#991b1b",
                }}>
                  {modal.member.reported ? "報告済" : "未報告"}
                </span>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                  <HiX style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </div>

            {/* ── 日別モーダル本体 ── */}
            {modal.mode === "daily" && (() => {
              const segs  = DAILY_WORK[modal.member.id] ?? [];
              const total = segs.reduce((s, x) => s + x.min, 0);
              return (
                <>
                  {/* 合計バー */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 5 }}>
                      <span>本日合計</span>
                      <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{(total / 60).toFixed(1)}h / 8.0h</span>
                    </div>
                    <div style={{ height: 10, background: "#f3f4f6", borderRadius: 5, display: "flex", overflow: "hidden" }}>
                      {segs.map((seg, i) => (
                        <div key={i} style={{
                          width: `${(seg.min / 480) * 100}%`,
                          background: PROJ_COLOR[seg.projectId],
                          borderRight: i < segs.length - 1 ? "1px solid white" : "none",
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* プロジェクト別タスク */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {segs.map((seg) => {
                      const proj = projects.find((p) => p.id === seg.projectId);
                      return (
                        <div key={seg.projectId} style={{ border: "1px solid #f3f4f6", borderRadius: 8, overflow: "hidden" }}>
                          {/* PJ見出し */}
                          <div style={{
                            padding: "8px 14px",
                            background: `${PROJ_COLOR[seg.projectId]}14`,
                            borderBottom: "1px solid #f3f4f6",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: PROJ_COLOR[seg.projectId] }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{proj?.name}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: PROJ_COLOR[seg.projectId] }}>
                              {(seg.min / 60).toFixed(1)}h
                            </span>
                          </div>
                          {/* タスク一覧 */}
                          {seg.tasks.map((t, i) => (
                            <div key={i} style={{
                              display: "flex", justifyContent: "space-between",
                              padding: "7px 14px",
                              borderBottom: i < seg.tasks.length - 1 ? "1px solid #f9fafb" : "none",
                              background: "white",
                            }}>
                              <span style={{ fontSize: 12, color: "#374151" }}>{t.name}</span>
                              <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{t.min}分</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* ── 月別モーダル本体 ── */}
            {modal.mode === "monthly" && (() => {
              const pjMap    = MONTHLY_WORK[modal.member.id] ?? {};
              const segs     = Object.entries(pjMap).map(([pid, min]) => ({ projectId: pid, min }));
              const totalMin = segs.reduce((s, x) => s + x.min, 0);
              const maxMin   = 9600;

              return (
                <>
                  {/* 合計サマリー */}
                  <div style={{
                    background: "#f9fafb", borderRadius: 8, padding: "12px 16px",
                    marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>月間合計工数</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>
                        {(totalMin / 60).toFixed(1)}<span style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginLeft: 2 }}>h</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>稼働率</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5" }}>
                        {Math.round((totalMin / maxMin) * 100)}<span style={{ fontSize: 12, color: "#6b7280" }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* プロジェクト別グラフ */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {segs.map((seg) => {
                      const proj = projects.find((p) => p.id === seg.projectId);
                      const pct  = Math.round((seg.min / totalMin) * 100);
                      return (
                        <div key={seg.projectId}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: PROJ_COLOR[seg.projectId] }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{proj?.name}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <span style={{ fontSize: 11, color: "#6b7280" }}>{pct}%</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: PROJ_COLOR[seg.projectId] }}>
                                {(seg.min / 60).toFixed(1)}h
                              </span>
                            </div>
                          </div>
                          {/* バー */}
                          <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`, height: "100%",
                              background: PROJ_COLOR[seg.projectId],
                              borderRadius: 6, transition: "width 0.3s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}
    </div>
  );
}
