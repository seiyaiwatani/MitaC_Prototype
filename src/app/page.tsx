"use client";

import { useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { currentUser, repoCas, projects, badges } from "@/lib/mock-data";
import { useMission } from "@/contexts/MissionContext";
import { TaskLabel, ImplScope } from "@/types";
import { HiPencil, HiFlag, HiCheck, HiBadgeCheck, HiClipboardList, HiStar, HiFolder, HiChevronDown, HiChevronUp } from "react-icons/hi";
import type { IconType } from "react-icons"; // NavItem 型で使用
import { AvatarWithCostume, COSTUME_EFFECTS } from "@/components/AvatarWithCostume";
import type { HeadCostume, BodyCostume } from "@/components/AvatarWithCostume";
import { useAvatar } from "@/contexts/AvatarContext";
import gsap from "gsap";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { AvatarEditor } from "@/components/AvatarEditor";
import { BadgeDetailModal } from "@/components/BadgeDetailModal";
import { BADGE_ICON_MAP, TIER_STYLE } from "@/lib/badge-config";
import type { Badge } from "@/types";
import { fmtDuration } from "@/lib/utils";

const AVATAR_MAP: Record<string, string> = {
  fox:     "/avatars/avatar_fox.svg",
  cat:     "/avatars/avatar_cat.svg",
  doragon: "/avatars/avatar_doragon.svg",
};

// ===== GSAP Avatar Sub-Components =====
function BobAvatar({ avatarSrc, headCostume, bodyCostume }: {
  avatarSrc: string; headCostume: HeadCostume; bodyCostume: BodyCostume;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const tween = gsap.to(el, { y: -10, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: -1 });
    return () => { tween.kill(); gsap.set(el, { clearProps: "all" }); };
  }, []);
  return <div ref={ref}><AvatarWithCostume avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} size={80} /></div>;
}

function DepartAvatar({ avatarSrc, headCostume, bodyCostume, onComplete }: {
  avatarSrc: string; headCostume: HeadCostume; bodyCostume: BodyCostume; onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const tl = gsap.timeline({ onComplete });
    // その場で即回転
    tl.to(el, { rotation: 360, duration: 0.38, ease: "power2.inOut" })
      // 走って右へ退場
      .to(el, { x: 360, opacity: 0, duration: 0.48, ease: "power2.in" });
    return () => { tl.kill(); gsap.set(el, { clearProps: "all" }); };
  }, []);
  return <div ref={ref}><AvatarWithCostume avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} size={80} /></div>;
}

function ReturnAvatar({ avatarSrc, headCostume, bodyCostume, onComplete }: {
  avatarSrc: string; headCostume: HeadCostume; bodyCostume: BodyCostume; onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    gsap.set(el, { x: -360, opacity: 0 });
    const tl = gsap.timeline({ onComplete });
    // 左から走って登場（回転しながら）
    tl.to(el, { x: 0, opacity: 1, rotation: 360, duration: 0.42, ease: "power2.out" })
      // 着地バウンス
      .to(el, { y: -16, duration: 0.22, ease: "power2.out" })
      .to(el, { y: 0, duration: 0.28, ease: "bounce.out" });
    return () => { tl.kill(); gsap.set(el, { clearProps: "all" }); };
  }, []);
  return <div ref={ref}><AvatarWithCostume avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} size={80} /></div>;
}

function WalkAvatar({ avatarSrc, headCostume, bodyCostume }: {
  avatarSrc: string; headCostume: HeadCostume; bodyCostume: BodyCostume;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(el, { y: -7, duration: 0.26, ease: "power1.inOut" })
      .to(el, { y: 0,  duration: 0.26, ease: "power1.inOut" })
      .to(el, { y: -4, duration: 0.20, ease: "power1.inOut" })
      .to(el, { y: 0,  duration: 0.20, ease: "power1.inOut" });
    return () => { tl.kill(); gsap.set(el, { clearProps: "all" }); };
  }, []);
  return <div ref={ref}><AvatarWithCostume avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} size={80} /></div>;
}

const NEWS = [
  "新機能追加！バッジシートが追加されました",
  "1月10日にメンテナンスを実施します",
  "今月のTOPユーザーに特別ボーナスをプレゼント",
];

type NavItem = { label: string; Icon: IconType; color: string } & (
  | { href: string; onClick?: never }
  | { href?: never; onClick: () => void }
);

const NAV_LINKS: NavItem[] = [
  { href: "/mypage",          label: "バッジ",       Icon: HiBadgeCheck,  color: "#10b981" },
  { href: "/mypage/rewards",  label: "報酬交換",     Icon: HiStar,        color: "#f59e0b" },
  { href: "/mypage/missions", label: "ミッション",   Icon: HiFlag,        color: "#4f46e5" },
  { href: "/admin",           label: "プロジェクト", Icon: HiFolder,      color: "#6366f1" },
];

type FilterType = "全て" | "未完了" | "完了";
type AttendanceState = "idle" | "departing" | "working" | "returning";

export default function Home() {
  const [projectId, setProjectId]     = useState(projects[0].id);
  const [label, setLabel]             = useState<TaskLabel>("新規作成");
  const [implScope, setImplScope]     = useState<ImplScope>("フロント");
  const [taskContent, setTaskContent] = useState("");
  const [attendance, setAttendance]   = useState<AttendanceState>("idle");
  const { avatarKey, setAvatarKey, headCostume, setHeadCostume, bodyCostume, setBodyCostume } = useAvatar();
  const { addTodayRepoCa, toggleTodayRepoCa } = useRepoCa();
  const { missions, toggleMission }      = useMission();
  const [editorOpen, setEditorOpen]     = useState(false);
  const [missionTab, setMissionTab]       = useState<"daily" | "monthly" | "unlimited">("daily");
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const MYPAGE_NAV: NavItem[] = [
    ...NAV_LINKS,
    { label: "アバター", Icon: HiPencil, color: "#ec4899", onClick: () => setEditorOpen(true) },
  ];

  const handleCheckIn = () => {
    if (attendance !== "idle") return;
    setAttendance("departing");
  };
  const handleCheckOut = () => {
    if (attendance !== "working") return;
    setAttendance("returning");
  };

  const handleCreateRepoCa = () => {
    if (!taskContent.trim()) return;
    const newRc = {
      id: `rc_${Date.now()}`,
      projectId,
      taskType: "開発" as const,
      label,
      implScope,
      content: taskContent.trim(),
      isFavorite: false,
      isCompleted: false,
      duration: 0,
      xp: 30,
      createdAt: new Date().toISOString(),
    };
    addTodayRepoCa(newRc);
    setLocalRepoCas((prev) => [...prev, newRc]);
    setTaskContent("");
  };

  // タスク（本日のRepoCa）- ローカル状態でトグル可能に
  const [localRepoCas, setLocalRepoCas] = useState(
    repoCas.filter((r) => ["rc1","rc2","rc3","rc4","rc5"].includes(r.id))
  );
  const [taskFilter, setTaskFilter] = useState<FilterType>("全て");

  const toggleTask = (id: string) => {
    setLocalRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
    toggleTodayRepoCa(id);
  };

  const filteredRepoCas = localRepoCas.filter((r) => {
    if (taskFilter === "未完了") return !r.isCompleted;
    if (taskFilter === "完了")   return r.isCompleted;
    return true;
  });

  const completedCount = localRepoCas.filter((r) => r.isCompleted).length;
  const dailyMissions  = missions.filter((m) => m.type === "daily");
  const acquiredBadges = badges.filter((b) => b.acquired).length;
  const xpPct          = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const avatarSrc      = AVATAR_MAP[avatarKey] ?? AVATAR_MAP.fox;
  // 装備中コスチュームの効果チップ（頭=紫、胴体=緑）
  const activeEffectChips = [
    headCostume ? { key: headCostume, color: "#4f46e5", label: `効果: ${COSTUME_EFFECTS[headCostume].label}` } : null,
    bodyCostume ? { key: bodyCostume, color: "#10b981", label: `効果: ${COSTUME_EFFECTS[bodyCostume].label}` } : null,
  ].filter(Boolean) as { key: string; color: string; label: string }[];

  return (
    <div className="page-root">

      {/* ニュースティッカー */}
      <div className="news-ticker">
        <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", flexShrink: 0 }}>お知らせ</span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="news-ticker-inner">
            {NEWS.concat(NEWS).map((n, i) => (
              <span key={i} style={{ marginRight: 40 }}>◇ {n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* クイックナビ */}
      <div style={{
        flexShrink: 0, background: "white", borderBottom: "1px solid #e5e7eb",
        display: "flex", padding: "6px 10px", gap: 20, overflowX: "auto", justifyContent: "center",
      }}>
        {MYPAGE_NAV.map((item) => {
          const btnStyle = {
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "7px 22px", borderRadius: 99, textDecoration: "none",
            fontSize: 13, color: "#374151", fontWeight: 700, whiteSpace: "nowrap" as const,
            background: "#f3f4f6", flexShrink: 0 as const, border: "none", cursor: "pointer",
          };
          return item.href ? (
            <Link key={item.label} href={item.href} style={btnStyle}>
              {item.label}
            </Link>
          ) : (
            <button key={item.label} onClick={item.onClick} style={btnStyle}>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 3カラムメインエリア */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 340px 1fr", gap: 20, padding: 12, overflow: "hidden" }}>

        {/* ====== 左: 本日のタスク ====== */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ヘッダー */}
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>本日のタスク</span>
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
                {completedCount}/{localRepoCas.length} 完了
              </span>
            </div>
            {/* フィルタータブ */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["全て", "未完了", "完了"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setTaskFilter(f)} style={{
                  flex: 1, padding: "4px 0", borderRadius: 99, border: "none", fontSize: 10, fontWeight: 700,
                  cursor: "pointer",
                  background: taskFilter === f ? "#4f46e5" : "#f3f4f6",
                  color:      taskFilter === f ? "white"   : "#6b7280",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* タスクリスト */}
          <div className="scroll-y" style={{ flex: 1, padding: "4px 8px" }}>
            {localRepoCas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 8px", color: "#9ca3af" }}>
                <p style={{ fontSize: 11, marginBottom: 8 }}>本日の始業報告はされていません。</p>
                <Link href="/report/start">
                  <button className="btn btn-primary" style={{ fontSize: 11, padding: "5px 12px" }}>始業報告</button>
                </Link>
              </div>
            ) : filteredRepoCas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 8px", color: "#9ca3af", fontSize: 11 }}>
                該当するタスクがありません
              </div>
            ) : (
              filteredRepoCas.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div
                    key={rc.id}
                    onClick={() => toggleTask(rc.id)}
                    onMouseEnter={() => setHoveredTask(rc.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "7px 4px", borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      opacity: rc.isCompleted ? 0.6 : 1,
                      position: "relative",
                    }}
                  >
                    {hoveredTask === rc.id && (
                      <div style={{
                        position: "absolute",
                        top: "calc(100% + 4px)", left: 0, right: 0,
                        background: "#1a1a2e", color: "white",
                        borderRadius: 10, padding: "10px 12px",
                        zIndex: 50, boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                        pointerEvents: "none",
                      }}>
                        <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>{rc.content}</p>
                        {[
                          { label: "種別",   value: rc.taskType },
                          { label: "ラベル", value: rc.label },
                          { label: "範囲",   value: rc.implScope },
                          { label: "XP",     value: `+${rc.xp} XP` },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                            <span style={{ color: "#9ca3af" }}>{label}</span>
                            <span style={{ fontWeight: 600 }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                      background: rc.isCompleted ? "#10b981" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                      transition: "all 0.15s",
                    }}>
                      {rc.isCompleted && <HiCheck style={{ width: 11, height: 11 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, margin: 0, fontWeight: 500, lineHeight: 1.35,
                        color: rc.isCompleted ? "#9ca3af" : "#1f2937",
                        textDecoration: rc.isCompleted ? "line-through" : "none",
                      }}>
                        {rc.content}
                      </p>
                      <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
                        {proj && (
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 99,
                            background: proj.color, color: proj.textColor,
                          }}>
                            {proj.name}
                          </span>
                        )}
                        <span style={{ fontSize: 9, color: "#9ca3af" }}>{rc.label}</span>
                        {rc.duration > 0 && (
                          <span style={{ fontSize: 9, color: "#9ca3af" }}>{fmtDuration(rc.duration)}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                      +{rc.xp}XP
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* 今日のミッション */}
          <div style={{ padding: "6px 10px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#6b7280", marginBottom: 5 }}>
              <HiFlag style={{ width: 11, height: 11, color: "#4f46e5" }} />
              今日のミッション
            </div>
            {dailyMissions.map((m) => {
              const pct = Math.min(Math.round((m.progress / m.goal) * 100), 100);
              return (
                <div key={m.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{m.title}</span>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>+{m.reward}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="xp-bar" style={{ flex: 1 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#10b981,#059669)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 9, color: "#9ca3af", whiteSpace: "nowrap" }}>{m.progress}/{m.goal}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ボタン */}
          <div style={{ padding: "6px 10px", display: "flex", gap: 6, flexShrink: 0, borderTop: "1px solid #e5e7eb" }}>
            <Link href="/report/start" style={{ flex: 1 }}>
              <button className="btn btn-primary" style={{ width: "100%", fontSize: 11, padding: "7px 4px" }}>始業報告</button>
            </Link>
            <Link href="/report/end" style={{ flex: 1 }}>
              <button className="btn" style={{ width: "100%", fontSize: 11, padding: "7px 4px", background: "#f59e0b", color: "white" }}>終業報告</button>
            </Link>
          </div>
        </div>

        {/* ====== 中央: ユーザーステータス + ミッション ====== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", height: "100%" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0, flexShrink: 0 }}>

          {/* ゲームシーン */}
          {attendance !== "working" ? (
            /* ホームシーン (idle / departing / returning) */
            <div className="avatar-game-wrap" style={{ height: 160, flex: "none" }}>
              <div style={{ position: "absolute", bottom: "33%", left: "5%",  fontSize: 28 }}>🌲</div>
              <div style={{ position: "absolute", bottom: "31%", left: "16%", fontSize: 22 }}>🌲</div>
              <div style={{ position: "absolute", bottom: "29%", left: "25%", fontSize: 16 }}>🌿</div>
              <div style={{ position: "absolute", bottom: "31%", right: "6%", fontSize: 40 }}>🏠</div>
              {/* アバター (中央揃えラッパー) */}
              <div style={{ position: "absolute", bottom: "30%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                {attendance === "departing" ? (
                  <DepartAvatar avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} onComplete={() => setAttendance("working")} />
                ) : attendance === "returning" ? (
                  <ReturnAvatar avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} onComplete={() => setAttendance("idle")} />
                ) : (
                  <BobAvatar avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} />
                )}
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "#5a8a3c" }} />
              <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", background: "rgba(255,255,255,0.75)", padding: "2px 8px", borderRadius: 6 }}>
                  {currentUser.name}
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  {activeEffectChips.map((eff) => (
                    <span key={eff.key} style={{
                      fontSize: 8, fontWeight: 700,
                      background: "rgba(255,255,255,0.88)", color: eff.color,
                      borderRadius: 99, padding: "1px 6px",
                    }}>
                      {eff.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 冒険シーン (working) */
            <div className="avatar-game-wrap" style={{ height: 160, flex: "none" }}>
              {/* スクロールする雲 */}
              <div style={{ position: "absolute", top: "6%", left: 0, right: 0, overflow: "hidden", height: 32 }}>
                <div style={{ display: "flex", gap: 120, animation: "scroll-left-loop 9s linear infinite", width: "max-content" }}>
                  {["⛅","⛅","⛅","⛅","⛅","⛅","⛅","⛅"].map((c, i) => (
                    <span key={i} style={{ fontSize: 20, flexShrink: 0 }}>{c}</span>
                  ))}
                </div>
              </div>
              {/* スクロールする木 */}
              <div style={{ position: "absolute", bottom: "28%", left: 0, right: 0, overflow: "hidden", height: 52 }}>
                <div style={{ display: "flex", gap: 70, alignItems: "flex-end", animation: "scroll-left-loop 3s linear infinite", width: "max-content" }}>
                  {["🌲","🌿","🌲","🌲","🌿","🌲","🌲","🌿","🌲","🌿","🌲","🌲","🌿","🌲","🌲","🌿"].map((t, i) => (
                    <span key={i} style={{ fontSize: 28, flexShrink: 0 }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* 地面 */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "#5a8a3c" }} />
              {/* 歩くアバター */}
              <div style={{ position: "absolute", bottom: "30%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <WalkAvatar avatarSrc={avatarSrc} headCostume={headCostume} bodyCostume={bodyCostume} />
              </div>
              {/* 出勤中バッジ */}
              <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", background: "rgba(255,255,255,0.75)", padding: "2px 8px", borderRadius: 6 }}>
                  {currentUser.name}
                </span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 11, color: "white", background: "#10b981", padding: "2px 10px", borderRadius: 99 }}>
                    🏃 出勤中
                  </span>
                  {activeEffectChips.map((eff) => (
                    <span key={eff.key} style={{
                      fontSize: 8, fontWeight: 700,
                      background: "rgba(255,255,255,0.88)", color: eff.color,
                      borderRadius: 99, padding: "1px 6px",
                    }}>
                      {eff.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* XPバー + コスチューム効果 */}
          <div style={{ padding: "8px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280", marginBottom: 3 }}>
              <span style={{ fontWeight: 600 }}>EXP</span>
              <span>{currentUser.xp} / {currentUser.xpToNext}</span>
            </div>
            <div style={{ height: 7, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#a855f7)", borderRadius: 4 }} />
            </div>
            {/* 装備中コスチュームの効果 */}
            {activeEffectChips.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                {activeEffectChips.map((eff) => (
                  <span key={eff.key} style={{
                    fontSize: 9, fontWeight: 700,
                    background: eff.color + "22", color: eff.color,
                    borderRadius: 99, padding: "1px 7px",
                    border: `1px solid ${eff.color}44`,
                  }}>
                    {eff.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 本日の進捗サマリー */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", flexShrink: 0 }}>
            {[
              { Icon: HiClipboardList, label: "本日タスク", value: `${completedCount}/${localRepoCas.length}`, color: "#4f46e5" },
              { Icon: HiBadgeCheck,    label: "バッジ",     value: `${acquiredBadges}個`,                      color: "#10b981" },
              { Icon: HiStar,         label: "レベル",     value: `Lv.${currentUser.level}`,                  color: "#f59e0b" },
            ].map(({ Icon, label, value, color }, i) => (
              <div key={label} style={{
                padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                borderRight: i < 2 ? "1px solid #e5e7eb" : "none",
                borderBottom: "1px solid #e5e7eb",
              }}>
                <Icon style={{ width: 16, height: 16, color }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>{value}</span>
                <span style={{ fontSize: 9, color: "#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* 出退勤ボタン */}
          <div style={{ padding: "14px 20px 16px", display: "flex", gap: 12, borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <button
              onClick={handleCheckIn}
              disabled={attendance !== "idle"}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 10, border: "none",
                background: attendance === "idle" ? "#fef9c3" : "#f3f4f6",
                color: attendance === "idle" ? "#78350f" : "#9ca3af",
                fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
                cursor: attendance === "idle" ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {attendance === "departing" ? "出発中…" : "出 勤"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={attendance !== "working"}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 10, border: "none",
                background: attendance === "working" ? "#dbeafe" : "#f3f4f6",
                color: attendance === "working" ? "#1e40af" : "#9ca3af",
                fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
                cursor: attendance === "working" ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {attendance === "returning" ? "帰宅中…" : "退 勤"}
            </button>
          </div>
        </div>

          {/* ミッション */}
          {(() => {
            const tabMissions   = missions.filter((m) => m.type === missionTab);
            const doneCount     = tabMissions.filter((m) => m.completed).length;
            const TABS: { key: "daily" | "monthly" | "unlimited"; label: string }[] = [
              { key: "daily",     label: "日" },
              { key: "monthly",   label: "月" },
              { key: "unlimited", label: "無期限" },
            ];
            return (
              <div className="card" style={{ padding: "10px 12px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#1a1a2e" }}>ミッション</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}>
                    {doneCount}/{tabMissions.length}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {TABS.map(({ key, label }) => (
                    <button key={key} onClick={() => setMissionTab(key)} style={{
                      padding: "2px 10px", borderRadius: 99, border: "none",
                      fontSize: 10, fontWeight: 700, cursor: "pointer",
                      background: missionTab === key ? "#ef4444" : "#f3f4f6",
                      color:      missionTab === key ? "white"   : "#6b7280",
                    }}>{label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {tabMissions.map((m) => (
                    <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }} onClick={() => toggleMission(m.id)}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                        border: `2px solid ${m.completed ? "#10b981" : "#d1d5db"}`,
                        background: m.completed ? "#10b981" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                      }}>
                        {m.completed && <HiCheck style={{ width: 11, height: 11, color: "white" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: m.completed ? "#9ca3af" : "#1f2937", textDecoration: m.completed ? "line-through" : "none" }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 1, lineHeight: 1.3 }}>{m.description}</div>
                      </div>
                      <span style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+{m.reward}</span>
                    </div>
                  ))}
                  {tabMissions.length === 0 && (
                    <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>ミッションはありません</div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ====== 右: RepoCa作成 + ショートカット ====== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", height: "100%" }}>

          {/* RepoCa作成 */}
          <div className="card" style={{ padding: 20, flexShrink: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14, color: "#1a1a2e" }}>RepoCa 作成</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 10px", fontSize: 13, color: "#374151" }}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <select value={label} onChange={(e) => setLabel(e.target.value as TaskLabel)}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 10px", fontSize: 13, color: "#374151" }}>
                  {(["新規作成", "修正", "調査", "レビュー"] as TaskLabel[]).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={implScope} onChange={(e) => setImplScope(e.target.value as ImplScope)}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 10px", fontSize: 13, color: "#374151" }}>
                  {(["フロント", "バック", "インフラ", "フルスタック", "その他"] as ImplScope[]).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea value={taskContent} onChange={(e) => setTaskContent(e.target.value)} placeholder="タスク内容" rows={4}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 10px", fontSize: 13, resize: "none", color: "#374151", boxSizing: "border-box", lineHeight: 1.6 }} />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 12, fontSize: 14, padding: "11px", opacity: taskContent.trim() ? 1 : 0.5, borderRadius: 10 }}
              onClick={handleCreateRepoCa}
              disabled={!taskContent.trim()}
            >
              新規作成
            </button>
          </div>

          {/* バッジ */}
          {(() => {
            const COLS = 6;
            const visibleBadges = showAllBadges ? badges : badges.slice(0, COLS * 2);
            return (
              <div className="card" style={{ padding: "10px 12px", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* ヘッダー */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: "#1a1a2e" }}>バッジ</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {(["bronze","silver","gold"] as const).map((t) => (
                      <span key={t} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#6b7280" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: TIER_STYLE[t].bg, display: "inline-block" }} />
                        {TIER_STYLE[t].label}
                      </span>
                    ))}
                  </div>
                </div>
                {/* グリッド */}
                <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gap: 7,
                  alignContent: "start",
                }}>
                  {visibleBadges.map((b) => {
                    const iconInfo = BADGE_ICON_MAP[b.name];
                    const ts = b.tier ? TIER_STYLE[b.tier] : null;
                    return (
                      <div
                        key={b.id}
                        title={`${b.name}${b.tier ? ` [${TIER_STYLE[b.tier].label}]` : ""}: ${b.description}`}
                        onClick={() => setSelectedBadge(b)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          border: `2px solid ${ts ? ts.border : "#e5e7eb"}`,
                          background: ts ? ts.bg : "#f3f4f6",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          opacity: b.acquired ? 1 : 0.35,
                        }}>
                          {iconInfo ? (
                            <iconInfo.Icon style={{
                              width: 18, height: 18,
                              color: ts ? "white" : "#9ca3af",
                            }} />
                          ) : (
                            <span style={{ fontSize: 16 }}>{b.icon}</span>
                          )}
                        </div>
                        <span style={{
                          fontSize: 9, fontWeight: 600, textAlign: "center",
                          color: ts ? ts.labelColor : "#9ca3af",
                        }}>
                          {b.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* 展開ボタン */}
                {badges.length > COLS * 2 && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <button
                      onClick={() => setShowAllBadges((v) => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 12px" }}
                    >
                      {showAllBadges
                        ? <HiChevronUp style={{ width: 14, height: 14 }} />
                        : <HiChevronDown style={{ width: 14, height: 14 }} />
                      }
                    </button>
                  </div>
                )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* アバター衣装エディター */}
      {editorOpen && (
        <AvatarEditor
          avatar={avatarKey}
          avatarSrc={avatarSrc}
          headCostume={headCostume}
          bodyCostume={bodyCostume}
          onAvatarChange={setAvatarKey}
          onHeadChange={setHeadCostume}
          onBodyChange={setBodyCostume}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* バッジ詳細モーダル */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
}
