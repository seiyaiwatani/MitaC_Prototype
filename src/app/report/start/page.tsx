"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects } from "@/lib/mock-data";
import { RepoCa } from "@/types";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};

export default function StartReport() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const favorites  = repoCas.filter((r) => r.isFavorite);
  const others     = repoCas.filter((r) => !r.isFavorite);
  const allCards   = [...favorites, ...others];
  const totalXp    = selected.reduce((s, id) => s + (repoCas.find((r) => r.id === id)?.xp ?? 0), 0);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const getProj = (pid: string) => projects.find((p) => p.id === pid);

  // カードコンポーネント
  const RepoCaItem = ({ rc, mini = false }: { rc: RepoCa; mini?: boolean }) => {
    const isSelected = selected.includes(rc.id);
    return (
      <div
        className={`repoca-card ${isSelected ? "selected" : ""}`}
        style={{ marginBottom: 6 }}
        onClick={() => toggle(rc.id)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 3 }}>
              <span className="chip chip-indigo" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
                {getProj(rc.projectId)?.name}
              </span>
              <span
                className="chip"
                style={{ background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}
              >
                {rc.implScope}
              </span>
            </div>
            <p style={{ fontSize: mini ? 11 : 12, fontWeight: 500, color: "#1f2937", margin: 0, lineHeight: 1.3 }}>
              {rc.content}
            </p>
            {!mini && (
              <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{rc.taskType}</span>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{rc.label}</span>
                {rc.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
                <span style={{ fontSize: 10, color: "#4f46e5", fontWeight: 700, marginLeft: "auto" }}>+{rc.xp}XP</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: 16, marginLeft: 6, flexShrink: 0 }}>
            {isSelected ? "✅" : "⬜"}
          </span>
        </div>
      </div>
    );
  };

  /* ── 確認画面 ── */
  if (showConfirm) {
    return (
      <div className="page-root">
        <header
          style={{
            height: 48, flexShrink: 0,
            display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
            background: "linear-gradient(90deg,#4f46e5,#7c3aed)", color: "white",
          }}
        >
          <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 22 }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🌅 始業報告 — 確認</span>
        </header>

        <div className="page-body" style={{ padding: 12, flexDirection: "column", gap: 10, overflowY: "auto" }}>
          {/* 報告サマリー */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>確認スタータス</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "始業報告", status: "確認済", ok: true },
                { label: "終業報告", status: "未確認", ok: false },
                { label: "残業報告", status: "未確認", ok: false },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span>{row.label}</span>
                  <span className={row.ok ? "status-ok" : "status-ng"}>{row.status}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                <span>完了タスク</span>
                <span style={{ fontWeight: 700 }}>0/{selected.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>獲得XP（予定）</span>
                <span style={{ fontWeight: 700, color: "#4f46e5" }}>+{totalXp} XP</span>
              </div>
            </div>
          </div>

          {/* 選択済みRepoCa */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              選択済み RepoCa（{selected.length}枚）
            </div>
            {selected.map((id) => {
              const rc = repoCas.find((r) => r.id === id);
              if (!rc) return null;
              const proj = getProj(rc.projectId);
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f9fafb" }}>
                  <span style={{ color: "#4f46e5" }}>✓</span>
                  <span className="chip chip-indigo" style={{ fontSize: 10 }}>{proj?.name}</span>
                  <span style={{ fontSize: 12, color: "#374151" }}>{rc.content}</span>
                </div>
              );
            })}
          </div>

          {/* ボタン */}
          <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>修正</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => { alert("始業報告を提出しました！ 🌟"); router.push("/"); }}
            >
              送信
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 選択画面（2カラム）── */
  return (
    <div className="page-root">
      <header
        style={{
          height: 48, flexShrink: 0,
          display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
          background: "linear-gradient(90deg,#4f46e5,#7c3aed)", color: "white",
        }}
      >
        <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: 22 }}>←</Link>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🌅 始業報告</span>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.8 }}>
          選択中: {selected.length}枚
        </span>
      </header>

      {/* 2カラム */}
      <div className="page-body split-layout" style={{ padding: "8px", gap: 8 }}>

        {/* 左列: 今日のカードを追加（選択済み） */}
        <div className="split-col">
          <div className="split-col-header">
            <span>今日のカードを追加</span>
            <span className="chip chip-indigo">{selected.length}</span>
          </div>
          <div className="split-col-body">
            {selected.length === 0 ? (
              <div className="repoca-card slot-empty" style={{ height: 70 }}>
                右からカードを選択
              </div>
            ) : (
              selected.map((id) => {
                const rc = repoCas.find((r) => r.id === id);
                return rc ? <RepoCaItem key={id} rc={rc} mini /> : null;
              })
            )}
          </div>
        </div>

        {/* 右列: 類似カードを追加（全RepoCa） */}
        <div className="split-col">
          <div className="split-col-header">
            <span>類似カードを追加</span>
            <Link href="/repoca/new" style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none" }}>+ 新規</Link>
          </div>
          <div className="split-col-body">
            {favorites.length > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>⭐ お気に入り</div>
            )}
            {allCards.map((rc) => (
              <RepoCaItem key={rc.id} rc={rc} />
            ))}
          </div>
        </div>
      </div>

      {/* 下部ボタン */}
      <div
        style={{
          flexShrink: 0, padding: "8px 12px",
          borderTop: "1px solid #e5e7eb",
          display: "flex", gap: 8, background: "white",
        }}
      >
        <Link href="/" style={{ flex: 1 }}>
          <button className="btn btn-ghost" style={{ width: "100%" }}>戻る</button>
        </Link>
        <button
          className="btn btn-primary"
          style={{ flex: 2 }}
          disabled={selected.length === 0}
          onClick={() => setShowConfirm(true)}
        >
          次へ（{selected.length}枚）
        </button>
      </div>
    </div>
  );
}
