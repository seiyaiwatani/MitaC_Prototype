"use client";

import { HiX } from "react-icons/hi";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import type { SeasonRewardType } from "@/types";

const NODE_W      = 56;
const MILESTONE_W = 80;

const TYPE_CHIP: Partial<Record<SeasonRewardType, { label: string; bg: string; color: string }>> = {
  avatar_costume: { label: "衣装",    bg: "#ede9fe", color: "#5b21b6" },
  physical:       { label: "報酬", bg: "#fef3c7", color: "#92400e" },
};

function getDaysRemaining(endDate: string) {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000));
}

interface Props {
  onClose: () => void;
}

export function SeasonPassModal({ onClose }: Props) {
  const { passLevel, passExp, passExpToNext, maxPassLevel, seasonName, endDate, rewards } = useSeasonPass();

  const expPct    = Math.round((passExp / passExpToNext) * 100);
  const daysLeft  = getDaysRemaining(endDate);
  const endLabel  = new Date(endDate).toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
  const rewardMap = Object.fromEntries(rewards.map((r) => [r.level, r]));
  const levels    = Array.from({ length: maxPassLevel }, (_, i) => i + 1);

  const totalTrackW = levels.reduce((s, lv) => s + (rewardMap[lv] ? MILESTONE_W : NODE_W), 0);

  let accFirst = 0;
  for (const lv of levels) { if (rewardMap[lv]) break; accFirst += NODE_W; }
  const firstMilCenterX  = 14 + accFirst + MILESTONE_W / 2;
  const lastMilHalfW     = MILESTONE_W / 2;
  const nextMilestoneLevel = rewards.find(r => r.level > passLevel)?.level;

  let progressEndX = 14;
  let accProg = 0;
  for (const lv of levels) {
    const w = rewardMap[lv] ? MILESTONE_W : NODE_W;
    if (lv <= passLevel) progressEndX = 14 + accProg + w / 2;
    accProg += w;
    if (lv === passLevel) break;
  }
  const showProgress = progressEndX > firstMilCenterX;
  const progressW    = progressEndX - firstMilCenterX;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10000, padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#b8c9e7",
          borderRadius: 18,
          width: "min(680px, 100%)",
          maxHeight: "85vh",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 0" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>シーズンパス</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 4 }}>
            <HiX style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* シーズンバナー */}
          <div style={{
            background: "#007aff",
            borderRadius: 14, padding: "14px 18px", color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, opacity: 0.75, letterSpacing: 1, marginBottom: 3 }}>SEASON PASS</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{seasonName}</div>
              </div>
              <div style={{
                background: "#f59e0b", color: "#78350f",
                fontSize: 14, fontWeight: 800,
                padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap",
              }}>
                残り {daysLeft}日（{endLabel}まで）
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px", textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 14, opacity: 0.8 }}>パスLv.</div>
                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{passLevel}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 14, opacity: 0.8 }}>PXP</span>
                  <span style={{ fontSize: 14, opacity: 0.8 }}>{passExp} / {passExpToNext}</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${expPct}%`, height: "100%", background: "linear-gradient(90deg,#facc15,#f59e0b)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
              <div style={{ fontSize: 14, opacity: 0.7, flexShrink: 0 }}>→ Lv.{passLevel + 1}</div>
            </div>
          </div>

          {/* 報酬トラック */}
          <div className="card" style={{ padding: "12px 0 10px" }}>
            <div style={{ paddingLeft: 14, marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>報酬トラック</span>
              <span style={{ fontSize: 14, color: "#9ca3af", marginLeft: 8 }}>5レベルごとに報酬獲得</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", minWidth: `${totalTrackW + 28}px`, position: "relative", padding: "16px 14px 6px" }}>
                <div style={{ position: "absolute", top: 36, left: firstMilCenterX, right: 14 + lastMilHalfW, height: 3, background: "#e5e7eb", zIndex: 0 }} />
                {showProgress && (
                  <div style={{ position: "absolute", top: 36, left: firstMilCenterX, width: progressW, height: 3, background: "#007aff", zIndex: 1 }} />
                )}
                {rewards.map((reward, idx) => {
                  const prevLevel  = idx === 0 ? 0 : rewards[idx - 1].level;
                  const marginLeft = (reward.level - prevLevel - 1) * NODE_W;
                  const claimed    = reward.level <= passLevel;
                  const isCurrent  = reward.level === nextMilestoneLevel;
                  const chip       = TYPE_CHIP[reward.type];

                  return (
                    <div key={reward.level} style={{ width: MILESTONE_W, flexShrink: 0, marginLeft, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: claimed ? "#007aff" : isCurrent ? "#e0e7ff" : "white",
                        border: isCurrent ? "3px solid #007aff" : (claimed ? "none" : "2px solid #c4b5fd"),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: claimed ? 16 : 18,
                        color: claimed ? "white" : isCurrent ? "#007aff" : "#9ca3af",
                        boxShadow: isCurrent ? "0 0 0 4px #e0e7ff" : (!claimed ? "0 0 0 3px #ede9fe" : "none"),
                      }}>
                        {reward.icon}
                      </div>
                      <span style={{ fontSize: 14, marginTop: 4, fontWeight: 700, color: isCurrent ? "#007aff" : claimed ? "#9ca3af" : "#374151" }}>
                        Lv.{reward.level}
                      </span>
                      {chip && (
                        <span style={{ fontSize: 14, padding: "1px 4px", borderRadius: 3, marginTop: 2, background: chip.bg, color: chip.color, fontWeight: 700 }}>
                          {chip.label}
                        </span>
                      )}
                      <span style={{ fontSize: 14, textAlign: "center", marginTop: 1, color: claimed ? "#9ca3af" : "#374151", lineHeight: 1.3, maxWidth: MILESTONE_W - 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {reward.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
