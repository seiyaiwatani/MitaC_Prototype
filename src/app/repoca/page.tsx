"use client";

import { useState } from "react";
import Link from "next/link";
import { RepoCa } from "@/types";
import { fmtDuration } from "@/lib/utils";
import { HiCollection, HiSearch, HiCheckCircle, HiStar, HiCheck } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};
const TASK_ICON: Record<string, string> = { 開発: "💻", MTG: "🤝", その他: "📌", デイリースクラム: "🔄", 実装: "⚙️" };

const FILTERS = [
  { key: "all",        label: "すべて" },
  { key: "favorite",   label: "お気に入り" },
  { key: "incomplete", label: "未完了" },
  { key: "completed",  label: "完了" },
] as const;

export default function RepoCaList() {
  const { allRepoCas } = useRepoCa();
  const { projects } = useProjects();
  const [filter, setFilter]           = useState<"all" | "favorite" | "incomplete" | "completed">("all");
  const [search, setSearch]           = useState("");
  const [selectedRc, setSelectedRc]   = useState<RepoCa | null>(null);

  const filtered = allRepoCas.filter((rc) => {
    const proj = projects.find((p) => p.id === rc.projectId);
    const matchSearch =
      search === "" ||
      rc.content.toLowerCase().includes(search.toLowerCase()) ||
      (proj?.name ?? "").includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "favorite"   && rc.isFavorite) ||
      (filter === "completed"  && rc.isCompleted) ||
      (filter === "incomplete" && !rc.isCompleted);
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "作成済み", value: allRepoCas.length,                                     Icon: HiCollection,  color: "#4f46e5" },
    { label: "完了",     value: allRepoCas.filter((r) => r.isCompleted).length,        Icon: HiCheckCircle, color: "#10b981" },
    { label: "総XP",    value: `${allRepoCas.reduce((s, r) => s + r.xp, 0)}XP`,       Icon: HiStar,        color: "#f59e0b" },
  ];

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
        background: "linear-gradient(90deg,#10b981,#059669)", color: "white",
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 5 }}>
          <HiCollection style={{ width: 18, height: 18 }} /> RepoCa
        </span>
        {/* 検索 */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px",
        }}>
          <HiSearch style={{ width: 14, height: 14, flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: 12 }}
          />
        </div>
      </header>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 8, gap: 8 }}>

        {/* 統計 */}
        <div style={{ flexShrink: 0, display: "flex", gap: 6 }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ flex: 1, padding: "8px 6px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <s.Icon style={{ width: 20, height: 20, color: s.color }} />
              </div>
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
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                {f.key === "favorite"  && <HiStar  style={{ width: 10, height: 10 }} />}
                {f.key === "completed" && <HiCheck style={{ width: 10, height: 10 }} />}
                {f.label}
              </span>
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
            filtered.map((rc) => (
              <RepoCaCard key={rc.id} rc={rc} onClick={() => setSelectedRc(rc)} />
            ))
          )}
        </div>
      </div>

      {/* フローティング作成ボタン */}
      <Link href="/repoca/new" style={{
        position: "fixed", right: 20, bottom: 24,
        width: 56, height: 56, borderRadius: "50%",
        background: "linear-gradient(135deg,#10b981,#059669)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(16,185,129,0.5)",
        textDecoration: "none", fontSize: 28, color: "white",
        zIndex: 100,
      }}>
        +
      </Link>

      {/* 詳細モーダル */}
      {selectedRc && (
        <RepoCaDetailModal rc={selectedRc} onClose={() => setSelectedRc(null)} />
      )}
    </div>
  );
}

function RepoCaCard({ rc, onClick }: { rc: RepoCa; onClick: () => void }) {
  const { projects } = useProjects();
  const proj = projects.find((p) => p.id === rc.projectId);
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ padding: 10, marginBottom: 6, display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer" }}
    >
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
          <span style={{ fontSize: 12 }}>{TASK_ICON[rc.taskType] ?? "📌"}</span>
          <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
            {proj?.name}
          </span>
          <span className="chip" style={{ fontSize: 10, background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
            {rc.implScope}
          </span>
          {rc.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
        </div>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#1f2937", margin: 0 }}>{rc.content}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
          <span className="chip chip-gray" style={{ fontSize: 9 }}>{rc.label}</span>
          {rc.duration > 0 && (
            <span style={{ fontSize: 9, color: "#6b7280" }}>{fmtDuration(rc.duration)}</span>
          )}
          <span style={{ fontSize: 10, color: "#4f46e5", fontWeight: 700, marginLeft: "auto" }}>+{rc.xp} XP</span>
        </div>
      </div>
    </div>
  );
}

function RepoCaDetailModal({ rc, onClose }: { rc: RepoCa; onClose: () => void }) {
  const { projects } = useProjects();
  const proj = projects.find((p) => p.id === rc.projectId);
  const rows: { label: string; value: string }[] = [
    { label: "プロジェクト",   value: proj?.name ?? "—" },
    { label: "タスク種別",     value: `${TASK_ICON[rc.taskType] ?? "📌"} ${rc.taskType}` },
    { label: "ラベル",         value: rc.label },
    { label: "実装スコープ",   value: rc.implScope },
    { label: "工数",           value: rc.duration > 0 ? fmtDuration(rc.duration) : "未記入" },
    { label: "獲得XP",         value: `+${rc.xp} XP` },
    { label: "作成日",         value: rc.createdAt.slice(0, 10) },
    { label: "ステータス",     value: rc.isCompleted ? "✓ 完了" : "未完了" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 16, width: 340, maxWidth: "92vw",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          background: "linear-gradient(135deg,#10b981,#059669)",
          padding: "16px 20px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
              {proj && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: proj.color, color: proj.textColor,
                }}>
                  {proj.icon} {proj.name}
                </span>
              )}
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                background: "rgba(255,255,255,0.25)", color: "white",
              }}>
                {rc.taskType}
              </span>
              {rc.isFavorite && (
                <span style={{ fontSize: 12 }}>⭐</span>
              )}
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.4 }}>
              {rc.content}
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.25)", borderRadius: 8,
            padding: "4px 10px", textAlign: "center", flexShrink: 0,
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>+{rc.xp}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>XP</div>
          </div>
        </div>

        {/* 詳細テーブル */}
        <div style={{ padding: "14px 20px 10px" }}>
          {rows.map((r) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: 12,
            }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
              <span style={{
                color: r.label === "ステータス" ? (rc.isCompleted ? "#10b981" : "#9ca3af") :
                       r.label === "獲得XP"     ? "#4f46e5" : "#1f2937",
                fontWeight: r.label === "獲得XP" ? 700 : 500,
              }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div style={{ padding: "8px 20px 18px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 10,
              border: "none", background: "#f3f4f6",
              fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#374151",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
