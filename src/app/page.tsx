"use client";

import Link from "next/link";
import { currentUser, repoCas, projects } from "@/lib/mock-data";

const REPORT_STATUS = [
  { key: "start",    label: "始業報告", done: true,  href: "/report/start" },
  { key: "end",      label: "終業報告", done: false, href: "/report/end" },
  { key: "overtime", label: "残業報告", done: false, href: "/report/overtime" },
];

export default function Home() {
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const todayRepoCas = repoCas.slice(0, 4);
  const completedCount = todayRepoCas.filter((r) => r.isCompleted).length;
  const getProject = (pid: string) => projects.find((p) => p.id === pid);

  return (
    <div className="page-root">
      {/* ヘッダー：ロゴ | XPバー | アバター情報 */}
      <header
        style={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
          color: "white",
        }}
      >
        {/* ロゴ */}
        <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 1, flexShrink: 0 }}>
          Mita=C
        </span>

        {/* XPバー（中央） */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
            <span>XP</span>
            <span>{currentUser.xp}/{currentUser.xpToNext}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${xpPct}%`, height: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 3 }} />
          </div>
        </div>

        {/* アバター情報 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, opacity: 0.7 }}>アバター→</span>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚔️</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: 12 }}>{currentUser.name}</span>
            <span style={{ fontSize: 10, opacity: 0.75 }}>Lv.{currentUser.level}</span>
          </div>
        </div>
      </header>

      {/* メインエリア（2カラム） */}
      <div className="page-body" style={{ padding: 10, gap: 10 }}>

        {/* 左カラム: 本日のタスク */}
        <div style={{
          flex: 1.3,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg,#1e1b4b,#312e81)",
          borderRadius: 10,
          padding: 10,
          overflow: "hidden",
          gap: 6,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.9)", textAlign: "center", flexShrink: 0 }}>
            ～本日のタスク～
          </div>
          <div className="scroll-y" style={{ flex: 1 }}>
            {todayRepoCas.map((rc) => {
              const proj = getProject(rc.projectId);
              return (
                <div
                  key={rc.id}
                  className="card"
                  style={{ padding: 9, marginBottom: 6 }}
                >
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 3 }}>
                    <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {proj?.name}
                    </span>
                    <span className="chip chip-gray" style={{ fontSize: 10 }}>{rc.implScope}</span>
                    {rc.isFavorite && <span style={{ fontSize: 11 }}>⭐</span>}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: "#1f2937", margin: 0, lineHeight: 1.3 }}>
                    {rc.content}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#6b7280" }}>{rc.taskType}</span>
                    <span style={{
                      width: 16, height: 16, borderRadius: 3,
                      border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                      background: rc.isCompleted ? "#10b981" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "white", flexShrink: 0,
                    }}>
                      {rc.isCompleted ? "✓" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右カラム: 報告ステータス */}
        <div style={{
          flex: 0.9,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg,#1e1b4b,#312e81)",
          borderRadius: 10,
          padding: 10,
          gap: 6,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.9)", textAlign: "center", flexShrink: 0 }}>
            〜報告ステータス〜
          </div>

          {/* 各報告 */}
          {REPORT_STATUS.map((s) => (
            <Link key={s.key} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "white" }}>{s.label}</span>
                <span style={{
                  fontWeight: 700, fontSize: 12,
                  color: s.done ? "#4ade80" : "#f87171",
                  background: s.done ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                  padding: "2px 8px", borderRadius: 99,
                }}>
                  {s.done ? "提出済" : "未提出"}
                </span>
              </div>
            </Link>
          ))}

          {/* 完了タスク */}
          <div style={{
            background: "rgba(255,255,255,0.12)",
            borderRadius: 8,
            padding: "10px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "white" }}>完了タスク</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#a5b4fc" }}>
              {completedCount}/{todayRepoCas.length}
            </span>
          </div>

          {/* RepoCa作成へのリンク */}
          <Link href="/repoca/new" style={{ marginTop: "auto" }}>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "8px 12px",
              textAlign: "center",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              border: "1px dashed rgba(255,255,255,0.3)",
              cursor: "pointer",
            }}>
              + RepoCa作成
            </div>
          </Link>
        </div>
      </div>

      {/* 下部アクションボタン */}
      <div
        style={{
          flexShrink: 0,
          padding: "10px 16px",
          background: "white",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: 8,
        }}
      >
        <Link href="/report/start" style={{ flex: 1 }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", fontSize: 13 }}
          >
            🌅 始業報告
          </button>
        </Link>
        <Link href="/report/end" style={{ flex: 1 }}>
          <button
            className="btn"
            style={{ width: "100%", fontSize: 13, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
          >
            🌇 終業報告
          </button>
        </Link>
        <Link href="/report/overtime" style={{ flex: 1 }}>
          <button
            className="btn"
            style={{ width: "100%", fontSize: 13, background: "linear-gradient(90deg,#6b7280,#4b5563)", color: "white" }}
          >
            🌙 残業報告
          </button>
        </Link>
      </div>
    </div>
  );
}
