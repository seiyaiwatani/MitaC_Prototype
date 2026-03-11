"use client";

import { useState } from "react";
import {
  HiFolder, HiChartBar, HiCalendar, HiPlus, HiCog, HiX, HiFlag, HiCheck,
  HiGlobeAlt, HiDeviceMobile, HiShoppingCart, HiDesktopComputer,
} from "react-icons/hi";
import { useMission } from "@/contexts/MissionContext";
import { useProjects } from "@/contexts/ProjectContext";
import { Mission } from "@/types";

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

const PROJ_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  p1: HiGlobeAlt,
  p2: HiDesktopComputer,
  p3: HiDeviceMobile,
  p4: HiShoppingCart,
};

type ProjectDetail = {
  description: string;
  members: { role: string; count: number }[];
  techStack: string;
  myRole: string;
  jobContent: string;
  assignDate: string;
};

const PROJ_DETAIL: Record<string, ProjectDetail> = {
  p1: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "ディレクター", count: 1 }, { role: "デザイナー", count: 1 }, { role: "エンジニア", count: 3 }],
    techStack: "Next.js, TypeScript など",
    myRole: "フロントエンドエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2026年2月9日〜",
  },
  p2: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "デザイナー", count: 2 }, { role: "エンジニア", count: 2 }],
    techStack: "WordPress, PHP など",
    myRole: "フロントエンドエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2025年11月1日〜",
  },
  p3: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "デザイナー", count: 1 }, { role: "エンジニア", count: 4 }],
    techStack: "React Native, TypeScript など",
    myRole: "モバイルエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2026年1月15日〜",
  },
  p4: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "エンジニア", count: 3 }, { role: "デザイナー", count: 1 }],
    techStack: "Next.js, Go, PostgreSQL など",
    myRole: "フルスタックエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2025年12月1日〜",
  },
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

type View = "projects" | "daily" | "monthly" | "new-project" | "missions";

const NAV_ITEMS: { key: View; label: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> }[] = [
  { key: "projects",    label: "プロジェクト一覧", Icon: HiFolder },
  { key: "daily",       label: "工数管理/日",      Icon: HiChartBar },
  { key: "monthly",     label: "工数管理/月",      Icon: HiCalendar },
  { key: "new-project", label: "プロジェクト作成", Icon: HiPlus },
  { key: "missions",    label: "ミッション管理",   Icon: HiFlag },
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

  const [projName, setProjName] = useState("");
  const [projMemo, setProjMemo] = useState("");
  const { missions, toggleMission, addMission } = useMission();

  // ミッション作成フォーム
  const [mTitle, setMTitle]       = useState("");
  const [mDesc, setMDesc]         = useState("");
  const [mType, setMType]         = useState<Mission["type"]>("daily");
  const [mReward, setMReward]     = useState(30);
  const [mPassExp, setMPassExp]   = useState(20);
  const [mGoal, setMGoal]         = useState(1);

  const { projects, addProject } = useProjects();

  const [selectedProjId, setSelectedProjId] = useState<string>("p1");
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
        <span style={{ marginLeft: "auto", fontSize: 14, opacity: 0.7 }}>
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
          {view === "projects" && (() => {
            const selProj   = projects.find((p) => p.id === selectedProjId) ?? projects[0];
            const selDetail = selProj ? (PROJ_DETAIL[selProj.id] ?? PROJ_DETAIL.p1) : null;
            return (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* ページタイトル */}
                <div style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e", marginBottom: 14 }}>
                  アサインされているプロジェクト一覧
                </div>

                {/* マスター・詳細 レイアウト */}
                <div style={{
                  display: "flex", flex: 1, overflow: "hidden",
                  border: "1px solid #e5e7eb", borderRadius: 10,
                  background: "white",
                }}>
                  {/* 左: プロジェクトリスト */}
                  <div style={{
                    width: 230, flexShrink: 0,
                    borderRight: "1px solid #e5e7eb",
                    overflowY: "auto",
                  }}>
                    {projects.map((p) => {
                      const Icon     = PROJ_ICONS[p.id] ?? HiFolder;
                      const selected = selectedProjId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProjId(p.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: selected ? "14px 16px" : "12px 14px",
                            borderBottom: "1px solid #f3f4f6",
                            cursor: "pointer",
                            background: selected ? "#f3f4f6" : "white",
                            transition: "background 0.1s",
                          }}
                        >
                          <Icon style={{
                            width: 18, height: 18, flexShrink: 0,
                            color: selected ? (PROJ_COLOR[p.id] ?? "#4f46e5") : "#9ca3af",
                          }} />
                          <span style={{
                            flex: 1, fontSize: selected ? 14 : 13,
                            fontWeight: selected ? 700 : 500,
                            color: selected ? "#1a1a2e" : "#374151",
                            lineHeight: 1.3,
                          }}>
                            {p.name}
                          </span>
                          <span style={{ color: "#9ca3af", fontSize: 14, flexShrink: 0 }}>›</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 右: プロジェクト詳細 */}
                  {selProj && selDetail && (
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                      {/* 概要 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>概要</div>
                        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                          {selDetail.description}
                        </p>
                      </div>

                      {/* メンバー */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>メンバー</div>
                          <span style={{ fontSize: 14, color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}>
                            メンバーを見る &gt;
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {selDetail.members.map((m) => (
                            <div key={m.role} style={{ fontSize: 14, color: "#374151" }}>
                              {m.role}：{m.count}名
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 主な仕様技術 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>主な仕様技術</div>
                          <span style={{ fontSize: 14, color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}>
                            すべて見る &gt;
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: "#374151" }}>{selDetail.techStack}</div>
                      </div>

                      {/* 役割 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>役割</div>
                        <div style={{ fontSize: 14, color: "#374151" }}>{selDetail.myRole}</div>
                      </div>

                      {/* 業務内容 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>業務内容</div>
                        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                          {selDetail.jobContent}
                        </p>
                      </div>

                      {/* アサイン日 */}
                      <div>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>アサイン日</div>
                        <div style={{ fontSize: 14, color: "#374151" }}>{selDetail.assignDate}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── 工数管理/日 ── */}
          {view === "daily" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>工数管理 / 日 — 2026/02/24</div>

              {/* 凡例 */}
              <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                {projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
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
                            width: 64, fontSize: 14, flexShrink: 0, textAlign: "right",
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

                        <span style={{ fontSize: 14, color: "#6b7280", width: 28, flexShrink: 0, textAlign: "right" }}>
                          {(total / 60).toFixed(1)}h
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, width: 36, flexShrink: 0, color: m.reported ? "#10b981" : "#ef4444" }}>
                          {m.reported ? "報告済" : "未報告"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 8, paddingLeft: 72, display: "flex", justifyContent: "space-between", fontSize: 14, color: "#9ca3af" }}>
                <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
              </div>
            </>
          )}

          {/* ── 工数管理/月 ── */}
          {view === "monthly" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>工数管理 / 月 — 2026年2月</div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                各メンバーの月合計工数をプロジェクト別に集計しています
              </div>

              {/* 凡例 */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                {projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
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
                            fontSize: 14, fontWeight: 700, color: "#4f46e5",
                            cursor: "pointer", userSelect: "none",
                            textDecoration: "underline", textDecorationStyle: "dotted",
                          }}
                        >
                          {m.name}
                        </span>
                        <span style={{ fontSize: 14, color: "#6b7280" }}>
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
                              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", padding: "0 4px" }}>
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
                            <span key={seg.projectId} style={{ fontSize: 14, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
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

              <div style={{ marginTop: 16, borderTop: "1px solid #f3f4f6", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14, color: "#9ca3af" }}>
                <span>0h</span><span>40h</span><span>80h</span><span>120h</span><span>160h</span>
              </div>
            </>
          )}

          {/* ── ミッション管理 ── */}
          {view === "missions" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

              {/* 左: ミッション一覧 */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>ミッション一覧</div>
                {(["daily", "monthly", "unlimited"] as Mission["type"][]).map((type) => {
                  const label = type === "daily" ? "日次" : type === "monthly" ? "月次" : "無期限";
                  const list  = missions.filter((m) => m.type === type);
                  return (
                    <div key={type} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>{label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {list.length === 0 ? (
                          <div style={{ fontSize: 14, color: "#9ca3af", padding: "6px 0" }}>なし</div>
                        ) : list.map((m) => (
                          <div
                            key={m.id}
                            className="card"
                            style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                            onClick={() => toggleMission(m.id)}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                              border: `2px solid ${m.completed ? "#10b981" : "#d1d5db"}`,
                              background: m.completed ? "#10b981" : "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}>
                              {m.completed && <HiCheck style={{ width: 11, height: 11, color: "white" }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: m.completed ? "#9ca3af" : "#1f2937", textDecoration: m.completed ? "line-through" : "none" }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 1 }}>{m.description}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end", flexShrink: 0 }}>
                              <span style={{ fontSize: 14, color: "#ea580c", fontWeight: 700 }}>+{m.reward} XP</span>
                              {m.passExpReward ? (
                                <span style={{ fontSize: 14, color: "#1e40af", fontWeight: 700 }}>+{m.passExpReward} パスEXP</span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 右: ミッション作成フォーム */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>ミッション追加</div>
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>タイトル</label>
                      <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="例: 始業報告を3日連続提出"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>説明</label>
                      <input value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="ミッションの詳細説明"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>種別</label>
                      <select value={mType} onChange={(e) => setMType(e.target.value as Mission["type"])}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 6px", fontSize: 14 }}>
                        <option value="daily">日次</option>
                        <option value="monthly">月次</option>
                        <option value="unlimited">無期限</option>
                      </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "#ea580c", display: "block", marginBottom: 3 }}>アカウントXP</label>
                        <input type="number" min={0} value={mReward} onChange={(e) => setMReward(Number(e.target.value))}
                          style={{ width: "100%", border: "1px solid #fed7aa", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "#1e40af", display: "block", marginBottom: 3 }}>パスEXP</label>
                        <input type="number" min={0} value={mPassExp} onChange={(e) => setMPassExp(Number(e.target.value))}
                          style={{ width: "100%", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: 12, fontSize: 14 }}
                    disabled={!mTitle.trim()}
                    onClick={() => {
                      addMission({ type: mType, title: mTitle.trim(), description: mDesc.trim(), reward: mReward, passExpReward: mPassExp, goal: mGoal, progress: 0, completed: false });
                      setMTitle(""); setMDesc(""); setMType("daily"); setMReward(30); setMPassExp(20); setMGoal(1);
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── プロジェクト作成 ── */}
          {view === "new-project" && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>プロジェクト作成</div>
              <div className="card" style={{ padding: 14, maxWidth: 380 }}>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>プロジェクト名</label>
                  <input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="例: 社内基盤システム刷新"
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>メモ</label>
                  <textarea value={projMemo} onChange={(e) => setProjMemo(e.target.value)} placeholder="プロジェクトの概要・備考" rows={4}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }} onClick={() => setView("projects")}>キャンセル</button>
                  <button className="btn btn-primary" style={{ flex: 2, fontSize: 14 }} disabled={!projName.trim()}
                    onClick={() => { addProject(projName.trim()); setProjName(""); setProjMemo(""); setView("projects"); }}>
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
          zIndex: 9999, fontSize: 14, minWidth: 180, pointerEvents: "none",
        }}>
          <div style={{ fontWeight: 700, color: tooltip.titleColor, marginBottom: 6, fontSize: 14, display: "flex", alignItems: "center", gap: 5 }}>
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
                <div style={{ fontSize: 14, color: "#6b7280", marginTop: 3 }}>
                  {modal.mode === "daily" ? "2026/02/24 の工数詳細" : "2026年2月 の月次工数"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, padding: "3px 12px", borderRadius: 99,
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
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280", marginBottom: 5 }}>
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
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{proj?.name}</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: PROJ_COLOR[seg.projectId] }}>
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
                              <span style={{ fontSize: 14, color: "#374151" }}>{t.name}</span>
                              <span style={{ fontSize: 14, color: "#9ca3af", whiteSpace: "nowrap" }}>{t.min}分</span>
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
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 2 }}>月間合計工数</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>
                        {(totalMin / 60).toFixed(1)}<span style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginLeft: 2 }}>h</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 2 }}>稼働率</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5" }}>
                        {Math.round((totalMin / maxMin) * 100)}<span style={{ fontSize: 14, color: "#6b7280" }}>%</span>
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
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{proj?.name}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <span style={{ fontSize: 14, color: "#6b7280" }}>{pct}%</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: PROJ_COLOR[seg.projectId] }}>
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
