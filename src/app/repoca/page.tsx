"use client";

import { useState } from "react";
import Link from "next/link";
import { repoCas, projects } from "@/lib/mock-data";
import { RepoCa } from "@/types";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};
const TASK_ICON: Record<string, string> = { 開発: "💻", MTG: "🤝", その他: "📌" };

const FILTERS = [
  { key: "all",       label: "すべて" },
  { key: "favorite",  label: "⭐ お気に入り" },
  { key: "incomplete", label: "未完了" },
  { key: "completed", label: "✓ 完了" },
] as const;

export default function RepoCaList() {
  const [filter, setFilter] = useState<"all" | "favorite" | "incomplete" | "completed">("all");
  const [search, setSearch] = useState("");

  const filtered = repoCas.filter((rc) => {
    const proj = projects.find((p) => p.id === rc.projectId);
    const matchSearch =
      search === "" ||
      rc.content.toLowerCase().includes(search.toLowerCase()) ||
      (proj?.name ?? "").includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "favorite"  && rc.isFavorite) ||
      (filter === "completed" && rc.isCompleted) ||
      (filter === "incomplete" && !rc.isCompleted);
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "作成済み", value: repoCas.length, icon: "🃏" },
    { label: "完了",     value: repoCas.filter((r) => r.isCompleted).length, icon: "✅" },
    { label: "総XP",    value: `${repoCas.reduce((s, r) => s + r.xp, 0)}XP`, icon: "⭐" },
  ];

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
        background: "linear-gradient(90deg,#10b981,#059669)", color: "white",
      }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>🃏 RepoCa</span>
        {/* 検索 */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px",
        }}>
          <span style={{ fontSize: 12 }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: 12 }}
          />
        </div>
        <Link href="/repoca/new" style={{
          background: "white", color: "#059669", borderRadius: 20,
          padding: "4px 12px", fontSize: 11, fontWeight: 700, textDecoration: "none",
        }}>
          + 作成
        </Link>
      </header>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 8, gap: 8 }}>

        {/* 統計 */}
        <div style={{ flexShrink: 0, display: "flex", gap: 6 }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ flex: 1, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* フィルター */}
        <div style={{ flexShrink: 0, display: "flex", gap: 4 }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                flex: 1, padding: "5px 2px", borderRadius: 20, border: "none",
                fontSize: 10, fontWeight: 600, cursor: "pointer",
                background: filter === f.key ? "#10b981" : "#f3f4f6",
                color: filter === f.key ? "white" : "#6b7280",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* カードリスト */}
        <div className="scroll-y" style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🃏</div>
              <p style={{ fontSize: 13 }}>RepoCaが見つかりませんでした</p>
            </div>
          ) : (
            filtered.map((rc) => <RepoCaCard key={rc.id} rc={rc} />)
          )}
        </div>
      </div>
    </div>
  );
}

function RepoCaCard({ rc }: { rc: RepoCa }) {
  const proj = projects.find((p) => p.id === rc.projectId);
  return (
    <div className="card" style={{ padding: 10, marginBottom: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
      {/* 完了マーク */}
      <div style={{
        width: 18, height: 18, borderRadius: 3, flexShrink: 0, marginTop: 1,
        border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
        background: rc.isCompleted ? "#10b981" : "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: 10,
      }}>
        {rc.isCompleted ? "✓" : ""}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* タグ */}
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 12 }}>{TASK_ICON[rc.taskType]}</span>
          <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
            {proj?.name}
          </span>
          <span className="chip" style={{ fontSize: 10, background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
            {rc.implScope}
          </span>
          {rc.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
        </div>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#1f2937", margin: 0 }}>{rc.content}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <span className="chip chip-gray" style={{ fontSize: 9 }}>{rc.label}</span>
          <span style={{ fontSize: 10, color: "#4f46e5", fontWeight: 700, marginLeft: "auto" }}>+{rc.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
