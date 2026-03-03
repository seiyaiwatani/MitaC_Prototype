"use client";

import type { Badge } from "@/types";
import { BADGE_ICON_MAP, TIER_STYLE, TIER_ORDER } from "@/lib/badge-config";

interface Props {
  badge: Badge;
  onClose: () => void;
}

export function BadgeDetailModal({ badge, onClose }: Props) {
  const iconInfo = BADGE_ICON_MAP[badge.name];
  const currentTierStyle = badge.tier ? TIER_STYLE[badge.tier] : null;
  const currentTierIndex = badge.tier ? TIER_ORDER.indexOf(badge.tier) : -1;
  const nextTier = currentTierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[currentTierIndex + 1] : null;
  const hasProgress =
    badge.nextTierProgress !== undefined &&
    badge.nextTierGoal !== undefined &&
    badge.nextTierGoal > 0 &&
    nextTier !== null;
  const pct = hasProgress
    ? Math.min(Math.round((badge.nextTierProgress! / badge.nextTierGoal!) * 100), 100)
    : 0;

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
          background: "white", borderRadius: 16, width: 320, maxWidth: "92vw",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー：ティアカラー背景 */}
        <div style={{
          background: currentTierStyle ? currentTierStyle.bg : "#f3f4f6",
          padding: "24px 20px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          {/* 過去ティア小さいアイコン行 */}
          {(badge.tierHistory && badge.tierHistory.length > 0) && (
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              {TIER_ORDER.map((t) => {
                const earned = badge.tierHistory!.some((h) => h.tier === t);
                const isCurrent = badge.tier === t;
                const ts = TIER_STYLE[t];
                return (
                  <div
                    key={t}
                    style={{
                      width: isCurrent ? 44 : 28,
                      height: isCurrent ? 44 : 28,
                      borderRadius: isCurrent ? 10 : 8,
                      border: `2px solid ${earned ? ts.border : "#d1d5db"}`,
                      background: earned ? ts.bg : "#e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: earned ? 1 : 0.3,
                      transition: "all 0.15s",
                    }}
                  >
                    {iconInfo && (
                      <iconInfo.Icon
                        style={{
                          width: isCurrent ? 22 : 14,
                          height: isCurrent ? 22 : 14,
                          color: earned ? "white" : "#9ca3af",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* アイコン（取得していない場合） */}
          {(!badge.tierHistory || badge.tierHistory.length === 0) && (
            <div style={{
              width: 60, height: 60, borderRadius: 14,
              border: "3px solid rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {iconInfo && (
                <iconInfo.Icon style={{ width: 32, height: 32, color: "white", opacity: 0.6 }} />
              )}
            </div>
          )}
          {/* バッジ名 */}
          <div style={{ fontWeight: 800, fontSize: 18, color: "white", textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
            {badge.name}
          </div>
          {/* 現ティアラベル */}
          {currentTierStyle && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: "rgba(255,255,255,0.35)",
              color: "white",
              padding: "2px 10px", borderRadius: 99,
            }}>
              {currentTierStyle.label}
            </span>
          )}
        </div>

        {/* ボディ */}
        <div style={{ padding: "16px 20px 20px" }}>
          {/* 説明文 */}
          <p style={{ fontSize: 12, color: "#374151", margin: "0 0 14px", lineHeight: 1.6 }}>
            {badge.description}
          </p>

          {/* 次のティアへの進捗 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 5,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>
                {nextTier
                  ? `次のティア: ${TIER_STYLE[nextTier].label}`
                  : badge.tier ? "全ティア取得済み" : "初回取得条件"
                }
              </span>
              {hasProgress && (
                <span style={{ fontSize: 10, color: "#374151" }}>
                  {badge.nextTierProgress} / {badge.nextTierGoal}
                </span>
              )}
            </div>
            {badge.nextTierCondition && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: hasProgress ? 6 : 0 }}>
                {badge.nextTierCondition}
              </div>
            )}
            {hasProgress && (
              <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%", borderRadius: 3,
                  background: nextTier ? TIER_STYLE[nextTier].bg : "#10b981",
                  transition: "width 0.3s",
                }} />
              </div>
            )}
          </div>

          {/* 取得履歴 */}
          {badge.tierHistory && badge.tierHistory.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
                取得履歴
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[...badge.tierHistory].reverse().map((h, i) => {
                  const ts = TIER_STYLE[h.tier];
                  return (
                    <div key={i} style={{
                      padding: "6px 8px", borderRadius: 6,
                      background: "#f9fafb",
                      borderLeft: `3px solid ${ts.bg}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: h.note ? 3 : 0 }}>
                        <span style={{
                          width: 10, height: 10, borderRadius: "50%",
                          background: ts.bg, flexShrink: 0, display: "inline-block",
                        }} />
                        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: ts.labelColor }}>
                          {ts.label}バッジ取得
                        </span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>{h.date}</span>
                      </div>
                      {h.note && (
                        <p style={{ margin: "0 0 0 18px", fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>
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

        {/* フッター */}
        <div style={{ padding: "0 20px 20px" }}>
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
