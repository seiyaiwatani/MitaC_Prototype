"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import type { SeasonRewardType } from "@/types";

const TYPE_CHIP: Partial<Record<SeasonRewardType, { label: string; bg: string; color: string }>> = {
  avatar_costume: { label: "衣装",    bg: "#ede9fe", color: "#5b21b6" },
  physical:       { label: "物理報酬", bg: "#fef3c7", color: "#92400e" },
};

function getDaysRemaining(endDate: string) {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
}

export default function SeasonPassPage() {
  const { passLevel, passExp, passExpToNext, maxPassLevel, seasonName, endDate, rewards } = useSeasonPass();
  const [showRewardModal, setShowRewardModal] = useState(false);

  const expPct    = Math.round((passExp / passExpToNext) * 100);
  const daysLeft  = getDaysRemaining(endDate);
  const endLabel  = new Date(endDate).toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
  const rewardMap = Object.fromEntries(rewards.map((r) => [r.level, r]));
  const levels    = Array.from({ length: maxPassLevel }, (_, i) => i + 1);

  // トラックコンテナ幅の追跡
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackW, setTrackW] = useState(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setTrackW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 画面幅に応じてノード幅を動的計算（スクロールなし）
  const milestoneCount = levels.filter(lv => !!rewardMap[lv]).length;
  const nodeCount      = levels.length - milestoneCount;
  const PADDING        = 64;
  const EDGE_PAD       = PADDING / 2; // 各辺のパディング
  const availW         = trackW > 0 ? trackW - PADDING : 0;
  // milestoneW = 3 * nodeW となるよう計算
  const NODE_W      = availW > 0 ? Math.max(1, Math.floor(availW / (nodeCount + 3 * milestoneCount))) : 0;
  const MILESTONE_W = NODE_W * 3;

  // トラック総幅
  const totalTrackW = levels.reduce((sum, lv) => sum + (rewardMap[lv] ? MILESTONE_W : NODE_W), 0);

  const lastNodeHalfW  = (rewardMap[maxPassLevel] ? MILESTONE_W : NODE_W) / 2;

  // 最初・最終マイルストーンの中心X（ライン開始・終了点）
  let accBeforeFirstMilestone = 0;
  for (const lv of levels) { if (rewardMap[lv]) break; accBeforeFirstMilestone += NODE_W; }
  const firstMilestoneCenterX = EDGE_PAD + accBeforeFirstMilestone + MILESTONE_W / 2;

  // 進捗ライン：現在レベルノードの中心X（innerDiv座標）
  let currentLevelCenterX = EDGE_PAD;
  let accumulated = 0;
  for (const lv of levels) {
    const w = rewardMap[lv] ? MILESTONE_W : NODE_W;
    if (lv <= passLevel) currentLevelCenterX = EDGE_PAD + accumulated + w / 2;
    accumulated += w;
    if (lv === passLevel) break;
  }
  // Lv.5以降のみ進捗ラインを表示（最初のマイルストーン基点）
  const progressLineVisible = currentLevelCenterX > firstMilestoneCenterX;
  const progressLineWidth   = currentLevelCenterX - firstMilestoneCenterX;

  return (
    <div className="page-root">
      <div className="page-subheader">
        <Link href="/" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>シーズンパス</span>
        <span style={{ marginLeft: "auto" }} />
      </div>

      <div className="page-body" style={{ flexDirection: "column", overflowY: "auto", padding: "12px 0", gap: 12 }}>

        {/* ─── シーズンバナー ─── */}
        <div style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          borderRadius: 16, padding: "16px 20px", color: "white", flexShrink: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.75, letterSpacing: 1, marginBottom: 4 }}>SEASON PASS</div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{seasonName}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{
                background: "#f59e0b", color: "#78350f",
                fontSize: 14, fontWeight: 800,
                padding: "5px 12px", borderRadius: 99, whiteSpace: "nowrap",
              }}>
                残り {daysLeft}日（{endLabel}まで）
              </div>
              <button
                onClick={() => setShowRewardModal(true)}
                style={{
                  background: "rgba(255,255,255,0.2)", color: "white",
                  fontSize: 14, fontWeight: 700,
                  padding: "4px 12px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.4)",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                シーズン報酬一覧
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "rgba(255,255,255,0.2)", borderRadius: 10,
              padding: "6px 12px", textAlign: "center", flexShrink: 0,
            }}>
              <div style={{ fontSize: 14, opacity: 0.8 }}>パスLv.</div>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{passLevel}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 14, opacity: 0.8 }}>パスEXP</span>
                <span style={{ fontSize: 14, opacity: 0.8 }}>{passExp} / {passExpToNext}</span>
              </div>
              <div style={{ height: 10, background: "rgba(255,255,255,0.3)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{
                  width: `${expPct}%`, height: "100%",
                  background: "linear-gradient(90deg, #facc15, #f59e0b)",
                  borderRadius: 5, transition: "width 0.4s ease",
                }} />
              </div>
            </div>
            <div style={{ fontSize: 14, opacity: 0.7, flexShrink: 0 }}>→ Lv.{passLevel + 1}</div>
          </div>
        </div>

        {/* ─── 報酬トラック ─── */}
        <div className="card" style={{ padding: "14px 0 12px", flexShrink: 0 }}>
          <div style={{ paddingLeft: 14, marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>報酬トラック</span>
            <span style={{ fontSize: 14, color: "#9ca3af", marginLeft: 8 }}>5レベルごとに報酬獲得</span>
          </div>
          <div ref={trackRef} style={{ overflow: "hidden" }}>
            {NODE_W > 0 && <div style={{
              display: "flex",
              width: `${totalTrackW + PADDING}px`,
              position: "relative",
              padding: `20px ${EDGE_PAD}px 8px`,
              margin: "0 auto",
            }}>
              {/* トラックライン（背景）: 最初〜最後のマイルストーン間のみ */}
              <div style={{
                position: "absolute", top: 40,
                left: firstMilestoneCenterX, right: EDGE_PAD + lastNodeHalfW,
                height: 3,
                background: "#e5e7eb", zIndex: 0,
              }} />
              {/* トラックライン（進捗）: 最初のマイルストーン基点 */}
              {progressLineVisible && (
                <div style={{
                  position: "absolute", top: 40, left: firstMilestoneCenterX,
                  width: progressLineWidth, height: 3,
                  background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
                  zIndex: 1,
                }} />
              )}

              {/* マイルストーンのみ描画（非マイルストーンはmarginLeftでスペース確保） */}
              {rewards.map((reward, idx) => {
                const prevLevel  = idx === 0 ? 0 : rewards[idx - 1].level;
                const regsBefore = reward.level - prevLevel - 1;
                const marginLeft = regsBefore * NODE_W;
                const claimed    = reward.level <= passLevel;
                const circleSize = Math.min(40, MILESTONE_W - 8);
                const chip       = TYPE_CHIP[reward.type];

                return (
                  <div key={reward.level} style={{
                    width: MILESTONE_W, flexShrink: 0, marginLeft,
                    display: "flex", flexDirection: "column", alignItems: "center",
                    position: "relative", zIndex: 2,
                  }}>
                    <div style={{
                      width: circleSize, height: circleSize, borderRadius: "50%",
                      background: claimed ? "#4f46e5" : "white",
                      border: claimed ? "none" : "2px solid #c4b5fd",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: claimed ? 16 : 18,
                      color: claimed ? "white" : "#9ca3af",
                      boxShadow: !claimed ? "0 0 0 3px #ede9fe" : "none",
                    }}>
                      {reward.icon}
                    </div>

                    <span style={{
                      fontSize: 14, marginTop: 3, fontWeight: 700,
                      color: claimed ? "#9ca3af" : "#374151",
                    }}>
                      Lv.{reward.level}
                    </span>

                    {chip && (
                      <span style={{
                        fontSize: 14, padding: "1px 4px", borderRadius: 4, marginTop: 1,
                        background: chip.bg, color: chip.color, fontWeight: 700,
                      }}>
                        {chip.label}
                      </span>
                    )}

                    <span style={{
                      fontSize: 14, textAlign: "center", marginTop: 1,
                      color: claimed ? "#9ca3af" : "#374151",
                      lineHeight: 1.3, maxWidth: MILESTONE_W - 8,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {reward.name}
                    </span>
                  </div>
                );
              })}
            </div>}
          </div>
        </div>

      </div>

      {/* シーズン報酬一覧モーダル */}
      {showRewardModal && createPortal(
        <div
          onClick={() => setShowRewardModal(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100dvh",
            background: "rgba(0,0,0,0.5)", zIndex: 300,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white", borderRadius: 20,
              width: "100%", maxWidth: 480, maxHeight: "80dvh",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ヘッダー */}
            <div style={{
              background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              padding: "16px 20px", flexShrink: 0,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 2 }}>{seasonName}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>シーズン報酬一覧</div>
              </div>
              <button
                onClick={() => setShowRewardModal(false)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "white", borderRadius: "50%",
                  width: 32, height: 32, fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>

            {/* リスト */}
            <div style={{ overflowY: "auto", padding: "12px 16px 24px" }}>
              {rewards.map((reward) => {
                const chip    = TYPE_CHIP[reward.type];
                const claimed = reward.level <= passLevel;
                return (
                  <div key={reward.level} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 10, marginBottom: 6,
                    background: claimed ? "#f0fdf4" : "white",
                    border: `1px solid ${claimed ? "#bbf7d0" : "#e5e7eb"}`,
                    opacity: claimed ? 0.75 : 1,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: claimed ? "#4f46e5" : "#ede9fe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                    }}>
                      {claimed ? "✓" : reward.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>Lv.{reward.level}</span>
                        {chip && (
                          <span style={{
                            fontSize: 14, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                            background: chip.bg, color: chip.color,
                          }}>
                            {chip.label}
                          </span>
                        )}
                        {claimed && (
                          <span style={{ fontSize: 14, color: "#10b981", fontWeight: 700, marginLeft: "auto" }}>獲得済み</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, color: claimed ? "#6b7280" : "#1f2937", fontWeight: 500 }}>
                        {reward.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
