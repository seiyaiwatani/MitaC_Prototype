"use client";

import { HiX } from "react-icons/hi";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import type { SeasonRewardType } from "@/types";

const NODE_W      = 56;
const MILESTONE_W = 80;

const TYPE_CHIP: Partial<Record<SeasonRewardType, { label: string; bg: string; color: string }>> = {
  avatar_costume: { label: "衣装",    bg: "#ede9fe", color: "#5b21b6" },
  physical:       { label: "物理報酬", bg: "#fef3c7", color: "#92400e" },
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

  let progressLineW = 0;
  let accumulated   = 0;
  for (const lv of levels) {
    const w = rewardMap[lv] ? MILESTONE_W : NODE_W;
    if (lv < passLevel) {
      accumulated += w;
      progressLineW = accumulated - w / 2;
    } else if (lv === passLevel) {
      progressLineW = accumulated + w / 2;
      break;
    } else {
      break;
    }
  }

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
          background: "#f0f4ff",
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
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            borderRadius: 14, padding: "14px 18px", color: "white",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, opacity: 0.75, letterSpacing: 1, marginBottom: 3 }}>SEASON PASS</div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{seasonName}</div>
              </div>
              <div style={{
                background: "#f59e0b", color: "#78350f",
                fontSize: 11, fontWeight: 800,
                padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap",
              }}>
                残り {daysLeft}日（{endLabel}まで）
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px", textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 9, opacity: 0.8 }}>パスLv.</div>
                <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.1 }}>{passLevel}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>パスEXP</span>
                  <span style={{ fontSize: 10, opacity: 0.8 }}>{passExp} / {passExpToNext}</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.3)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${expPct}%`, height: "100%", background: "linear-gradient(90deg,#facc15,#f59e0b)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, flexShrink: 0 }}>→ Lv.{passLevel + 1}</div>
            </div>
          </div>

          {/* 報酬トラック */}
          <div className="card" style={{ padding: "12px 0 10px" }}>
            <div style={{ paddingLeft: 14, marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>報酬トラック</span>
              <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 8 }}>5レベルごとに報酬獲得</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", minWidth: `${totalTrackW + 28}px`, position: "relative", padding: "16px 14px 6px" }}>
                <div style={{ position: "absolute", top: 36, left: 28, width: totalTrackW, height: 3, background: "#e5e7eb", zIndex: 0 }} />
                {progressLineW > 0 && (
                  <div style={{ position: "absolute", top: 36, left: 28, width: progressLineW, height: 3, background: "linear-gradient(90deg,#4f46e5,#7c3aed)", zIndex: 1 }} />
                )}
                {levels.map((lv) => {
                  const reward      = rewardMap[lv];
                  const isMilestone = !!reward;
                  const claimed     = lv <= passLevel;
                  const isCurrent   = lv === passLevel + 1;
                  const nodeW       = isMilestone ? MILESTONE_W : NODE_W;
                  const circleSize  = isMilestone ? 40 : 28;
                  const chip        = reward ? TYPE_CHIP[reward.type] : undefined;

                  return (
                    <div key={lv} style={{ width: nodeW, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
                      <div style={{
                        width: circleSize, height: circleSize, borderRadius: "50%",
                        background: claimed ? (isMilestone ? "#4f46e5" : "#a78bfa") : isCurrent ? "#e0e7ff" : "white",
                        border: isCurrent ? "3px solid #4f46e5" : (claimed ? "none" : `2px solid ${isMilestone ? "#c4b5fd" : "#e5e7eb"}`),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: claimed ? (isMilestone ? 16 : 11) : (isMilestone ? 18 : 10),
                        color: claimed ? "white" : isCurrent ? "#4f46e5" : "#9ca3af",
                        boxShadow: isCurrent ? "0 0 0 4px #e0e7ff" : (isMilestone && !claimed ? "0 0 0 3px #ede9fe" : "none"),
                        fontWeight: !reward ? 600 : undefined,
                      }}>
                        {claimed ? (isMilestone ? reward!.icon : "✓") : (reward ? reward.icon : lv)}
                      </div>
                      <span style={{ fontSize: 8, marginTop: 4, fontWeight: isCurrent || isMilestone ? 700 : 400, color: isCurrent ? "#4f46e5" : claimed ? "#9ca3af" : (isMilestone ? "#374151" : "#9ca3af") }}>
                        Lv.{lv}
                      </span>
                      {chip && (
                        <span style={{ fontSize: 7, padding: "1px 4px", borderRadius: 3, marginTop: 2, background: chip.bg, color: chip.color, fontWeight: 700 }}>
                          {chip.label}
                        </span>
                      )}
                      {reward && (
                        <span style={{ fontSize: 8, textAlign: "center", marginTop: 1, color: claimed ? "#9ca3af" : "#374151", lineHeight: 1.3, maxWidth: MILESTONE_W - 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {reward.name}
                        </span>
                      )}
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
