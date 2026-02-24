"use client";

import Link from "next/link";
import { currentUser, repoCas, projects, missions } from "@/lib/mock-data";

const REPORT_STATUS = [
  { key: "start",    label: "始業報告", done: true,  href: "/report/start" },
  { key: "end",      label: "終業報告", done: false, href: "/report/end" },
  { key: "overtime", label: "残業報告", done: false, href: "/report/overtime" },
];

export default function Home() {
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const todayRepoCas = repoCas.slice(0, 4);
  const dailyMissions = missions.filter((m) => m.type === "daily");

  const getProject = (pid: string) => projects.find((p) => p.id === pid);

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header
        style={{
          height: 48,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
          color: "white",
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>Mita=C</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: 99 }}>
            💰 {currentUser.currency.toLocaleString()}
          </span>
          <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 99 }}>
            {currentUser.name}
          </span>
        </div>
      </header>

      {/* メインエリア（2カラム） */}
      <div className="page-body" style={{ padding: 8, gap: 8 }}>

        {/* 左カラム: キャラクター＋ステータス */}
        <div
          style={{
            width: 220,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {/* キャラクターカード */}
          <div
            className="card"
            style={{
              flex: "0 0 auto",
              background: "linear-gradient(160deg,#312e81,#4c1d95)",
              border: "none",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* アバター */}
            <div
              style={{
                width: 80, height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42,
                border: "3px solid rgba(255,255,255,0.4)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              ⚔️
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>
              {currentUser.name}
            </div>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "white",
                padding: "1px 10px",
                borderRadius: 99,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Lv.{currentUser.level}
            </span>
            {/* XPバー */}
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.7)", fontSize: 10, marginBottom: 3 }}>
                <span>XP</span>
                <span>{currentUser.xp}/{currentUser.xpToNext}</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>

          {/* 報告ステータス */}
          <div className="card" style={{ padding: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
              📋 今日の報告
            </div>
            {REPORT_STATUS.map((s) => (
              <Link key={s.key} href={s.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#374151" }}>{s.label}</span>
                  <span className={s.done ? "status-ok" : "status-ng"}>
                    {s.done ? "済" : "未"}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* 今日のミッション */}
          <div className="card" style={{ padding: 10, flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#6b7280", marginBottom: 8, flexShrink: 0 }}>
              🎯 今日のミッション
            </div>
            <div className="scroll-y" style={{ flex: 1 }}>
              {dailyMissions.map((m) => {
                const pct = Math.round((m.progress / m.goal) * 100);
                return (
                  <div key={m.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{m.title}</span>
                      <span className="chip chip-yellow">+{m.reward}💰</span>
                    </div>
                    <div className="xp-bar">
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: "linear-gradient(90deg,#10b981,#059669)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <div style={{ textAlign: "right", fontSize: 10, color: "#9ca3af", marginTop: 1 }}>
                      {m.progress}/{m.goal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右カラム: 今日のタスク */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
          {/* ヘッダー行 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#1e1b4b" }}>📌 今日のタスク</span>
            <div style={{ display: "flex", gap: 6 }}>
              <Link href="/report/start">
                <button className="btn btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>
                  🌅 始業報告
                </button>
              </Link>
              <Link href="/repoca/new">
                <button className="btn btn-success" style={{ fontSize: 12, padding: "6px 14px" }}>
                  + RepoCa作成
                </button>
              </Link>
            </div>
          </div>

          {/* タスクカードリスト */}
          <div className="scroll-y" style={{ flex: 1 }}>
            {todayRepoCas.map((rc) => {
              const proj = getProject(rc.projectId);
              return (
                <div
                  key={rc.id}
                  className="card"
                  style={{ padding: 10, marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}
                >
                  {/* 完了チェック */}
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                      background: rc.isCompleted ? "#10b981" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontSize: 12,
                    }}
                  >
                    {rc.isCompleted ? "✓" : ""}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* タグ行 */}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                      <span className="chip chip-indigo">{proj?.name}</span>
                      <span className="chip" style={{ background: "#fef9c3", color: "#78350f" }}>
                        {rc.implScope}
                      </span>
                      <span className="chip chip-gray">{rc.label}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#1f2937", margin: 0 }}>
                      {rc.content}
                    </p>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{rc.taskType}</span>
                      {rc.isFavorite && <span style={{ fontSize: 11 }}>⭐</span>}
                      <span style={{ fontSize: 11, color: "#4f46e5", fontWeight: 700, marginLeft: "auto" }}>
                        +{rc.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 終業報告ボタン */}
            <Link href="/report/end">
              <div
                className="card"
                style={{
                  padding: 12,
                  textAlign: "center",
                  borderStyle: "dashed",
                  borderColor: "#f59e0b",
                  background: "#fffbeb",
                  color: "#92400e",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                🌇 終業報告を提出する
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
