"use client";

import { useState } from "react";
import { currentUser, badges, missions } from "@/lib/mock-data";

const AVATARS = [
  { id: "warrior", icon: "⚔️", name: "戦士" },
  { id: "mage",    icon: "🧙", name: "魔法使い" },
  { id: "archer",  icon: "🏹", name: "弓使い" },
  { id: "knight",  icon: "🛡️", name: "騎士" },
];

const NOTICES = [
  "◇ 新機能追加！バッジシートが追加されました",
  "◇ 1月10日にメンテナンスを実施します",
  "◇ 今月のTOPユーザーに特別ボーナスをプレゼント",
];

export default function MyPage() {
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const acquiredBadges = badges.filter((b) => b.acquired);
  const lockedBadges   = badges.filter((b) => !b.acquired);
  const currentAvatarIcon = AVATARS.find((a) => a.id === avatar)?.icon ?? "⚔️";

  const missionGroups = [
    { type: "daily",     label: "デイリー", icon: "📅" },
    { type: "monthly",   label: "マンスリー", icon: "📆" },
    { type: "unlimited", label: "無期限",    icon: "♾️" },
  ] as const;

  return (
    <div className="page-root">
      {/* ヘッダー：ロゴ | XPバー | アバター情報 */}
      <header style={{
        height: 56, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: 12,
        background: "linear-gradient(90deg,#7c3aed,#db2777)",
        color: "white",
      }}>
        <span style={{ fontWeight: 800, fontSize: 16, flexShrink: 0 }}>Mita=C</span>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
            <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${xpPct}%`, height: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, opacity: 0.7 }}>アバター→</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            {currentAvatarIcon}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 700, fontSize: 12 }}>{currentUser.name}</span>
            <span style={{ fontSize: 10, opacity: 0.75 }}>Lv.{currentUser.level}</span>
          </div>
        </div>
      </header>

      {/* お知らせバー */}
      <div style={{
        flexShrink: 0,
        background: "#f5f5f5",
        borderBottom: "1px solid #e5e7eb",
        padding: "5px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        overflow: "hidden",
      }}>
        <div style={{
          background: "#b7b7b7",
          color: "white",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 8px",
          borderRadius: 4,
          flexShrink: 0,
        }}>
          お知らせ
        </div>
        <div style={{
          display: "flex",
          gap: 24,
          overflow: "hidden",
          fontSize: 11,
          color: "#374151",
          whiteSpace: "nowrap",
        }}>
          {NOTICES.map((notice, i) => (
            <span key={i}>{notice}</span>
          ))}
        </div>
      </div>

      {/* メイン（スクロールなし） */}
      <div className="page-body" style={{ padding: 8, gap: 8, overflow: "hidden" }}>

        {/* 左カラム: キャラクターカード＋アバター選択 */}
        <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* フィジカルカード */}
          <div className="card" style={{
            background: "linear-gradient(160deg,#312e81,#4c1d95)",
            border: "none", padding: 14,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#a855f7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 38, border: "3px solid rgba(255,255,255,0.4)",
            }}>
              {currentAvatarIcon}
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{currentUser.name}</div>
            <span style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "1px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
              Lv.{currentUser.level}
            </span>
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.7)", marginBottom: 2 }}>
                <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
              </div>
              <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${xpPct}%` }} /></div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                💰 {currentUser.currency.toLocaleString()}
              </div>
            </div>
          </div>

          {/* アバター選択 */}
          <div className="card" style={{ padding: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>アバター</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a.id)}
                  style={{
                    padding: "8px 4px", borderRadius: 8,
                    border: `2px solid ${avatar === a.id ? "#7c3aed" : "#e5e7eb"}`,
                    background: avatar === a.id ? "#f5f3ff" : "white",
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    fontSize: 20,
                  }}
                >
                  {a.icon}
                  <span style={{ fontSize: 9, color: avatar === a.id ? "#7c3aed" : "#6b7280", fontWeight: 600 }}>{a.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 工数報告（今月） */}
          <div className="card" style={{ padding: 10, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>今月の工数報告</div>
            <button className="btn btn-ghost" style={{ width: "100%", padding: "6px", fontSize: 11 }}>
              工数確認
            </button>
          </div>
        </div>

        {/* 右カラム: バッジ＋ミッション */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>

          {/* バッジエリア */}
          <div className="card" style={{ padding: 10, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              🏅 バッジ ({acquiredBadges.length}/{badges.length})
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {acquiredBadges.map((b) => (
                <div key={b.id} title={`${b.name}: ${b.description}`}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "linear-gradient(135deg,#fef9c3,#fef08a)",
                    border: "2px solid #f59e0b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, cursor: "pointer",
                  }}>
                  {b.icon}
                </div>
              ))}
              {lockedBadges.map((b) => (
                <div key={b.id} title={b.description}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "#f3f4f6", border: "2px solid #e5e7eb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, opacity: 0.4, cursor: "pointer",
                  }}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>

          {/* ミッション（3列） */}
          <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {missionGroups.map(({ type, label, icon }) => {
              const items = missions.filter((m) => m.type === type);
              return (
                <div key={type} className="card" style={{ padding: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, flexShrink: 0 }}>
                    {icon} {label}ミッション
                  </div>
                  <div className="scroll-y" style={{ flex: 1 }}>
                    {items.map((m) => {
                      const pct = Math.round((m.progress / m.goal) * 100);
                      const done = pct >= 100;
                      return (
                        <div key={m.id} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>{m.title}</span>
                            <span className="chip chip-yellow" style={{ fontSize: 9 }}>+{m.reward}💰</span>
                          </div>
                          <p style={{ fontSize: 10, color: "#6b7280", margin: "0 0 4px", lineHeight: 1.3 }}>{m.description}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{
                                width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 3,
                                background: done
                                  ? "linear-gradient(90deg,#f59e0b,#d97706)"
                                  : "linear-gradient(90deg,#7c3aed,#db2777)",
                              }} />
                            </div>
                            <span style={{ fontSize: 9, color: "#9ca3af", whiteSpace: "nowrap" }}>{m.progress}/{m.goal}</span>
                          </div>
                          {done && (
                            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, marginTop: 2, textAlign: "right" }}>
                              達成ボーナス！
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
