"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser, badges, missions } from "@/lib/mock-data";
import { BADGE_ICON_MAP, TIER_STYLE, TIER_ORDER } from "@/lib/badge-config";
import type { Badge } from "@/types";
import { HiArrowLeft, HiChevronRight } from "react-icons/hi";

const bronzeCount = badges.filter((b) => b.tier === "bronze").length;
const silverCount = badges.filter((b) => b.tier === "silver").length;
const goldCount   = badges.filter((b) => b.tier === "gold").length;

function BadgeDetailPanel({ badge }: { badge: Badge }) {
  const iconInfo = BADGE_ICON_MAP[badge.name];
  const currentTierStyle = badge.tier ? TIER_STYLE[badge.tier] : null;
  const currentTierIndex = badge.tier ? TIER_ORDER.indexOf(badge.tier) : -1;
  const nextTier = currentTierIndex >= 0 && currentTierIndex < TIER_ORDER.length - 1
    ? TIER_ORDER[currentTierIndex + 1] : null;
  const isMaxTier = badge.tier === "gold";
  const hasProgress =
    badge.nextTierProgress !== undefined &&
    badge.nextTierGoal !== undefined &&
    badge.nextTierGoal > 0 &&
    nextTier !== null;
  const pct = hasProgress
    ? Math.min(Math.round((badge.nextTierProgress! / badge.nextTierGoal!) * 100), 100)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* ティアカラーヘッダー */}
      <div style={{
        background: currentTierStyle ? currentTierStyle.bg : "#f3f4f6",
        padding: "20px 16px",
        flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}>
        {/* ティア段階アイコン行 */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {TIER_ORDER.map((t) => {
            const earned = badge.tierHistory?.some((h) => h.tier === t) ?? false;
            const isCurrent = badge.tier === t;
            const ts = TIER_STYLE[t];
            return (
              <div key={t} style={{
                width: isCurrent ? 52 : 32,
                height: isCurrent ? 52 : 32,
                borderRadius: isCurrent ? 12 : 8,
                border: `2px solid ${earned ? ts.border : "#d1d5db"}`,
                background: earned ? ts.bg : "#e5e7eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: earned ? 1 : 0.3,
                transition: "all 0.2s",
              }}>
                {iconInfo && (
                  <iconInfo.Icon style={{
                    width: isCurrent ? 26 : 16,
                    height: isCurrent ? 26 : 16,
                    color: earned ? "white" : "#9ca3af",
                  }} />
                )}
              </div>
            );
          })}
        </div>
        <div style={{ fontWeight: 800, fontSize: 16, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
          {badge.name}
        </div>
        {currentTierStyle ? (
          <span style={{
            fontSize: 14, fontWeight: 700,
            background: "rgba(255,255,255,0.3)", color: "white",
            padding: "2px 10px", borderRadius: 99,
          }}>
            {currentTierStyle.label}
          </span>
        ) : (
          <span style={{
            fontSize: 14, fontWeight: 700,
            background: "rgba(0,0,0,0.1)", color: "rgba(255,255,255,0.7)",
            padding: "2px 10px", borderRadius: 99,
          }}>
            未取得
          </span>
        )}
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* EXP・説明 */}
        <div>
          {badge.acquired && badge.exp !== undefined && (
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
              EXP: <span style={{ fontWeight: 700, color: "#4f46e5" }}>
                {badge.exp.toLocaleString()}
              </span>
            </div>
          )}
          <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6 }}>
            {badge.description}
          </p>
        </div>

        {/* 次ティアへの進捗 */}
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
              {nextTier
                ? `next : ${TIER_STYLE[nextTier].label}`
                : badge.tier ? "蓄積EXP" : "初回取得条件"
              }
            </span>
            {hasProgress && (
              <span style={{ fontSize: 14, color: "#6b7280" }}>
                {badge.nextTierProgress} / {badge.nextTierGoal}
              </span>
            )}
            {isMaxTier && badge.exp !== undefined && (
              <span style={{ fontSize: 14, color: "#6b7280" }}>
                {badge.exp.toLocaleString()} EXP
              </span>
            )}
          </div>
          {badge.nextTierCondition && !isMaxTier && (
            <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: hasProgress ? 6 : 0 }}>
              {badge.nextTierCondition}
            </div>
          )}
          {hasProgress && (
            <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", borderRadius: 3,
                background: nextTier ? TIER_STYLE[nextTier].bg : "#10b981",
              }} />
            </div>
          )}
          {isMaxTier && badge.exp !== undefined && (
            <div style={{ fontSize: 14, color: "#10b981", marginTop: 4 }}>
              ゴールド取得後も経験値を蓄積中
            </div>
          )}
        </div>

        {/* 取得履歴 */}
        {badge.tierHistory && badge.tierHistory.length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
              取得履歴
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[...badge.tierHistory].reverse().map((h, i) => {
                const ts = TIER_STYLE[h.tier];
                return (
                  <div key={i} style={{
                    padding: "6px 8px", borderRadius: 6, background: "#f9fafb",
                    borderLeft: `3px solid ${ts.bg}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: h.note ? 3 : 0 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: ts.bg, flexShrink: 0,
                      }} />
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: ts.labelColor }}>
                        {ts.label}バッジ取得
                      </span>
                      <span style={{ fontSize: 14, color: "#9ca3af" }}>{h.date}</span>
                    </div>
                    {h.note && (
                      <p style={{ margin: "0 0 0 18px", fontSize: 14, color: "#6b7280", lineHeight: 1.4 }}>
                        {h.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyPage() {
  const [selectedBadge, setSelectedBadge] = useState<Badge>(badges[0]);
  const missionDone = missions.filter((m) => m.completed).length;
  const acquiredCount = badges.filter((b) => b.acquired).length;

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>バッジ一覧</span>
        {/* ティア集計 */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          {([
            { tier: "bronze", count: bronzeCount, bg: "#d4855e", label: "ブロンズ" },
            { tier: "silver", count: silverCount, bg: "#8eadc4", label: "シルバー" },
            { tier: "gold",   count: goldCount,   bg: "#f5c842", label: "ゴールド" },
          ] as const).map(({ tier, count, bg, label }) => (
            <span key={tier} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#6b7280" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: bg, display: "inline-block" }} />
              {label} {count}
            </span>
          ))}
        </div>
      </div>

      {/* 2カラムボディ */}
      <div style={{
        flex: 1, overflow: "hidden",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
      }}>

        {/* ===== 左: バッジグリッド ===== */}
        <div style={{ overflowY: "auto", padding: 10 }}>

          {/* バッジグリッド */}
          <div className="card" style={{ padding: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>
              全バッジ（合計取得数: {acquiredCount}個）
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 8,
            }}>
              {badges.map((b) => {
                const iconInfo = BADGE_ICON_MAP[b.name];
                const ts = b.tier ? TIER_STYLE[b.tier] : null;
                const isSelected = selectedBadge.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBadge(b)}
                    title={b.name}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      cursor: "pointer",
                      padding: 4, borderRadius: 10,
                      background: isSelected ? "rgba(79,70,229,0.08)" : "transparent",
                      border: `2px solid ${isSelected ? "#4f46e5" : "transparent"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 10,
                      border: `2px solid ${ts ? ts.border : "#e5e7eb"}`,
                      background: ts ? ts.bg : "#f9fafb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: b.acquired ? 1 : 0.35,
                    }}>
                      {iconInfo ? (
                        <iconInfo.Icon style={{
                          width: 24, height: 24,
                          color: ts ? "white" : "#9ca3af",
                        }} />
                      ) : (
                        <span style={{ fontSize: 20 }}>{b.icon}</span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 600, textAlign: "center",
                      color: ts ? ts.labelColor : "#9ca3af",
                    }}>
                      {b.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ミッションリンク */}
          <Link href="/mypage/missions" style={{ textDecoration: "none" }}>
            <div className="card" style={{
              padding: "12px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10, cursor: "pointer",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 2 }}>ミッション</div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>達成 {missionDone}/{missions.length} 件</div>
              </div>
              <HiChevronRight style={{ width: 18, height: 18, color: "#9ca3af" }} />
            </div>
          </Link>

          {/* ステータス */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#1a1a2e" }}>ステータス</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280", marginBottom: 3 }}>
                  <span>Lv.{currentUser.level} → Lv.{currentUser.level + 1}</span>
                  <span>{currentUser.xp} / {currentUser.xpToNext} XP</span>
                </div>
                <div className="xp-bar">
                  <div
                    className="xp-bar-fill"
                    style={{ width: `${Math.round((currentUser.xp / currentUser.xpToNext) * 100)}%` }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                {[
                  { v: currentUser.level,    label: "Lv",   color: "#4f46e5" },
                  { v: acquiredCount,        label: "バッジ", color: "#10b981" },
                  { v: currentUser.currency, label: "コイン", color: "#f59e0b" },
                ].map(({ v, label, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color }}>{v.toLocaleString()}</div>
                    <div style={{ fontSize: 14, color: "#6b7280" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 右: バッジ詳細パネル ===== */}
        <div style={{
          borderLeft: "1px solid #e5e7eb",
          background: "white",
          overflow: "hidden",
        }}>
          <BadgeDetailPanel badge={selectedBadge} />
        </div>
      </div>
    </div>
  );
}
