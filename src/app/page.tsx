"use client";

import { useState, useLayoutEffect, useRef, useEffect } from "react";
import Link from "next/link";
import { currentUser, badges } from "@/lib/mock-data";
import { useMission } from "@/contexts/MissionContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import type { SeasonRewardType, RepoCa } from "@/types";
import {
  HiFlag,
  HiCheck,
  HiBadgeCheck,
  HiClipboardList,
  HiStar,
  HiChevronDown,
  HiChevronUp,
  HiExclamation,
  HiPencilAlt,
} from "react-icons/hi";
import {
  AvatarWithCostume,
  OMAMORI_EFFECTS,
} from "@/components/AvatarWithCostume";
import type { HeadCostume, BodyCostume } from "@/components/AvatarWithCostume";
import { useAvatar } from "@/contexts/AvatarContext";
import { AvatarEditor } from "@/components/AvatarEditor";
import gsap from "gsap";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { BADGE_ICON_MAP, TIER_STYLE, TIER_ORDER } from "@/lib/badge-config";
import type { Badge } from "@/types";
import { fmtDuration } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const AVATAR_MAP: Record<string, string> = {
  fox: `${BASE}/avatars/avatar_fox.svg`,
  cat: `${BASE}/avatars/avatar_cat.svg`,
  doragon: `${BASE}/avatars/avatar_doragon.svg`,
};

// ===== GSAP Avatar Sub-Components =====
function BobAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1 });
    // ふわふわ x2 → キョロキョロ → ふわふわ x2 → 短い静止
    tl.to(el, { y: -8, duration: 0.7, ease: "sine.inOut" })
      .to(el, { y: 0, duration: 0.7, ease: "sine.inOut" })
      .to(el, { y: -8, duration: 0.7, ease: "sine.inOut" })
      .to(el, { y: 0, duration: 0.7, ease: "sine.inOut" })
      .to(el, { rotation: -9, duration: 0.28, ease: "power2.out" })
      .to(el, { rotation: 9, duration: 0.42, ease: "power2.inOut" })
      .to(el, { rotation: 0, duration: 0.28, ease: "power2.in" })
      .to(el, { duration: 0.5 })
      .to(el, { y: -8, duration: 0.7, ease: "sine.inOut" })
      .to(el, { y: 0, duration: 0.7, ease: "sine.inOut" });
    return () => {
      tl.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, []);
  return (
    <div ref={ref}>
      <AvatarWithCostume
        avatarSrc={avatarSrc}
        headCostume={headCostume}
        bodyCostume={bodyCostume}
        size={80}
      />
    </div>
  );
}

function DepartAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
  onComplete,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { transformPerspective: 400 });
    const tl = gsap.timeline({ onComplete });
    // ジャンプしながらZ回転 → 着地
    tl.to(el, { rotation: 360, y: -20, duration: 0.32, ease: "power2.out" })
      .to(el, { y: 0, duration: 0.18, ease: "power1.in" })
      // Y軸フリップしながら走って退場
      .to(el, {
        x: 360,
        opacity: 0,
        rotationY: 360,
        rotation: "+=180",
        duration: 0.5,
        ease: "power2.in",
      });
    return () => {
      tl.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, []);
  return (
    <div ref={ref}>
      <AvatarWithCostume
        avatarSrc={avatarSrc}
        headCostume={headCostume}
        bodyCostume={bodyCostume}
        size={80}
      />
    </div>
  );
}

function ReturnAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
  onComplete,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  onComplete: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { x: -360, opacity: 0, transformPerspective: 400 });
    const tl = gsap.timeline({ onComplete });
    // 左から走って登場: Y軸フリップ+Z回転を交互に混ぜたタンブリング
    tl.to(el, {
      x: 0,
      opacity: 1,
      rotation: 270,
      rotationY: 180,
      duration: 0.42,
      ease: "power2.out",
    })
      // 着地バウンス（向きをリセット）
      .to(el, {
        rotation: 360,
        rotationY: 0,
        y: -16,
        duration: 0.18,
        ease: "power2.out",
      })
      .to(el, { y: 0, duration: 0.28, ease: "bounce.out" })
      // うれしそうなモーション: 1回目はZ回転ジャンプ
      .to(el, { y: -24, rotation: "+=360", duration: 0.32, ease: "power2.out" })
      .to(el, { y: 0, duration: 0.26, ease: "bounce.out" })
      // 2回目はY軸フリップ（側転）
      .to(el, {
        y: -18,
        rotationY: "+=360",
        duration: 0.28,
        ease: "power2.out",
      })
      .to(el, { y: 0, duration: 0.22, ease: "bounce.out" })
      .to(el, { scaleX: 1.35, scaleY: 0.68, duration: 0.1, ease: "power2.in" })
      .to(el, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.35,
        ease: "elastic.out(1.2, 0.4)",
      });
    return () => {
      tl.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, []);
  return (
    <div ref={ref}>
      <AvatarWithCostume
        avatarSrc={avatarSrc}
        headCostume={headCostume}
        bodyCostume={bodyCostume}
        size={80}
      />
    </div>
  );
}

function WalkAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ repeat: -1 });
    // 左右に体を傾けながら歩く
    tl.to(el, {
      y: -8,
      rotation: -5,
      scaleX: 0.96,
      duration: 0.23,
      ease: "power2.out",
    })
      .to(el, {
        y: 0,
        rotation: 0,
        scaleX: 1,
        duration: 0.23,
        ease: "power2.in",
      })
      .to(el, {
        y: -5,
        rotation: 5,
        scaleX: 0.96,
        duration: 0.19,
        ease: "power2.out",
      })
      .to(el, {
        y: 0,
        rotation: 0,
        scaleX: 1,
        duration: 0.19,
        ease: "power2.in",
      });
    return () => {
      tl.kill();
      gsap.set(el, { clearProps: "all" });
    };
  }, []);
  return (
    <div ref={ref}>
      <AvatarWithCostume
        avatarSrc={avatarSrc}
        headCostume={headCostume}
        bodyCostume={bodyCostume}
        size={80}
      />
    </div>
  );
}

function WorkResultModal({
  workedMinutes,
  completedCount,
  totalTasks,
  earnedXp,
  onClose,
}: {
  workedMinutes: number;
  completedCount: number;
  totalTasks: number;
  earnedXp: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 0.65, opacity: 0, y: 40 },
      { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: "back.out(1.7)" },
    );
  }, []);
  const h = Math.floor(workedMinutes / 60);
  const m = workedMinutes % 60;
  const timeStr = h > 0 ? `${h}時間${m > 0 ? `${m}分` : ""}` : `${m}分`;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        ref={ref}
        style={{
          background: "white",
          borderRadius: 24,
          padding: "32px 28px",
          width: 300,
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div style={{ fontSize: 52 }}>🎉</div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#1a1a2e",
              margin: "0 0 4px",
            }}
          >
            お疲れ様でした！
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
            本日も一日お疲れ様でした
          </p>
        </div>
        <div
          style={{
            width: "100%",
            background: "#f9fafb",
            borderRadius: 14,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {[
            { label: "勤務時間", value: timeStr, icon: "⏱️", color: "#4f46e5" },
            {
              label: "完了RepoCa",
              value: `${completedCount} / ${totalTasks} 件`,
              icon: "✅",
              color: "#10b981",
            },
            {
              label: "獲得XP",
              value: `+${earnedXp} XP`,
              icon: "⭐",
              color: "#f59e0b",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color }}>
                {value}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(90deg,#6366f1,#a855f7)",
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

// ===== 天気 =====
type WeatherInfo = {
  skyColor: string;
  clouds: string[];
  cloudSpeed: number;
  icon: string;
  label: string;
};
const DEFAULT_WEATHER: WeatherInfo = {
  skyColor: "#87ceeb",
  clouds: ["☁️", "⛅", "☁️", "☁️", "⛅", "☁️", "☁️", "⛅"],
  cloudSpeed: 22,
  icon: "⛅",
  label: "くもり",
};
function codeToWeather(code: number, isDay: boolean): WeatherInfo {
  if (!isDay)
    return {
      skyColor: "#1c2a4a",
      clouds: ["🌙", "⭐", "🌙", "⭐", "🌙", "⭐", "🌙", "⭐"],
      cloudSpeed: 40,
      icon: "🌙",
      label: "夜",
    };
  if (code === 0)
    return {
      skyColor: "#4fa8e8",
      clouds: ["☀️", "  ", "☀️", "  ", "☀️", "  ", "☀️", "  "],
      cloudSpeed: 60,
      icon: "☀️",
      label: "晴れ",
    };
  if (code <= 2)
    return {
      skyColor: "#87ceeb",
      clouds: ["🌤️", "☁️", "🌤️", "☁️", "🌤️", "☁️", "🌤️", "☁️"],
      cloudSpeed: 22,
      icon: "🌤️",
      label: "晴れのちくもり",
    };
  if (code <= 3)
    return {
      skyColor: "#a0b8cc",
      clouds: ["☁️", "☁️", "☁️", "☁️", "☁️", "☁️", "☁️", "☁️"],
      cloudSpeed: 18,
      icon: "☁️",
      label: "くもり",
    };
  if (code <= 48)
    return {
      skyColor: "#b8c4cc",
      clouds: ["🌫️", "🌫️", "🌫️", "🌫️", "🌫️", "🌫️", "🌫️", "🌫️"],
      cloudSpeed: 25,
      icon: "🌫️",
      label: "霧",
    };
  if (code <= 67 || (code >= 80 && code <= 82))
    return {
      skyColor: "#5a6a7a",
      clouds: ["🌧️", "☁️", "🌧️", "☁️", "🌧️", "☁️", "🌧️", "☁️"],
      cloudSpeed: 10,
      icon: "🌧️",
      label: "雨",
    };
  if (code <= 77)
    return {
      skyColor: "#a8bcc8",
      clouds: ["🌨️", "❄️", "🌨️", "❄️", "🌨️", "❄️", "🌨️", "❄️"],
      cloudSpeed: 18,
      icon: "🌨️",
      label: "雪",
    };
  if (code >= 95)
    return {
      skyColor: "#3e4858",
      clouds: ["⛈️", "☁️", "⛈️", "☁️", "⛈️", "☁️", "⛈️", "☁️"],
      cloudSpeed: 8,
      icon: "⛈️",
      label: "雷雨",
    };
  return DEFAULT_WEATHER;
}

const NEWS = [
  "新機能追加！バッジシートが追加されました",
  "1月10日にメンテナンスを実施します",
  "今月のTOPユーザーに特別ボーナスをプレゼント",
];

type FilterType = "全て" | "未完了" | "完了";
type AttendanceState = "idle" | "departing" | "working" | "returning";

export default function Home() {
  const { projects } = useProjects();
  const {
    passLevel,
    passExp,
    passExpToNext,
    maxPassLevel,
    seasonName,
    endDate,
    rewards,
  } = useSeasonPass();
  const [attendance, setAttendance] = useState<AttendanceState>("idle");
  const {
    avatarKey,
    setAvatarKey,
    headCostume,
    setHeadCostume,
    bodyCostume,
    setBodyCostume,
    omamori,
    setOmamori,
  } = useAvatar();
  const [editorOpen, setEditorOpen] = useState(false);
  const {
    allRepoCas,
    todayRepoCas,
    addTodayRepoCa,
    toggleTodayRepoCa,
    updateRepoCa,
    hasStartReported,
    hasOvertimeReported,
    hasEndReported,
  } = useRepoCa();
  const { missions } = useMission();
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(
    badges[0] ?? null,
  );
  const [selectedTask, setSelectedTask] = useState<RepoCa | null>(null);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [showWorkResult, setShowWorkResult] = useState(false);
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [weather, setWeather] = useState<WeatherInfo>(DEFAULT_WEATHER);

  // 東京の天気を取得（Open-Meteo API）
  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=35.6762&longitude=139.6503&current=weather_code,is_day&timezone=Asia%2FTokyo",
    )
      .then((r) => r.json())
      .then((data) =>
        setWeather(
          codeToWeather(data.current.weather_code, data.current.is_day === 1),
        ),
      )
      .catch(() => {}); // fallback to default
  }, []);

  const handleCheckIn = () => {
    if (attendance !== "idle") return;
    setWorkStartTime(new Date());
    setAttendance("departing");
  };
  const handleCheckOut = () => {
    if (attendance !== "working") return;
    setAttendance("returning");
  };

  // タスク（本日のRepoCa）- コンテキストの todayRepoCas を直接使用
  const [taskFilter, setTaskFilter] = useState<FilterType>("全て");

  const toggleTask = (id: string) => {
    toggleTodayRepoCa(id);
  };

  const filteredRepoCas = todayRepoCas.filter((r) => {
    if (taskFilter === "未完了") return !r.isCompleted;
    if (taskFilter === "完了") return r.isCompleted;
    return true;
  });

  const completedCount = todayRepoCas.filter((r) => r.isCompleted).length;
  const dailyMissions = missions.filter((m) => m.type === "daily");
  const acquiredBadges = badges.filter((b) => b.acquired).length;
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const avatarSrc = AVATAR_MAP[avatarKey] ?? AVATAR_MAP.fox;
  // おまもりの効果チップ
  const activeEffectChips = omamori
    ? [
        {
          key: omamori,
          color: OMAMORI_EFFECTS[omamori].color,
          label: `効果: ${OMAMORI_EFFECTS[omamori].label}`,
        },
      ]
    : [];

  return (
    <div className="page-root">
      {/* ニュースティッカー */}
      <div className="news-ticker">
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#4f46e5",
            flexShrink: 0,
          }}
        >
          お知らせ
        </span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="news-ticker-inner">
            {NEWS.concat(NEWS).map((n, i) => (
              <span key={i} style={{ marginRight: 40 }}>
                ◇ {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 警告バナー */}
      {!hasStartReported && (
        <div
          style={{
            flexShrink: 0,
            background: "#fef3c7",
            borderBottom: "1px solid #fcd34d",
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <HiExclamation style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "#92400e", flex: 1 }}
          >
            本日の始業報告がまだ提出されていません
          </span>
          <Link href="/report/start">
            <button
              style={{
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 12px",
                cursor: "pointer",
              }}
            >
              始業報告する
            </button>
          </Link>
        </div>
      )}
      {hasStartReported && !hasOvertimeReported && (
        <div
          style={{
            flexShrink: 0,
            background: "#ede9fe",
            borderBottom: "1px solid #c4b5fd",
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <HiExclamation style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "#4c1d95", flex: 1 }}
          >
            残業報告がまだ提出されていません
          </span>
          <Link href="/report/overtime">
            <button
              style={{
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 12px",
                cursor: "pointer",
              }}
            >
              残業報告する
            </button>
          </Link>
        </div>
      )}
      {hasStartReported && hasOvertimeReported && !hasEndReported && (
        <div
          style={{
            flexShrink: 0,
            background: "#fef3c7",
            borderBottom: "1px solid #fcd34d",
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <HiExclamation style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span
            style={{ fontSize: 12, fontWeight: 700, color: "#92400e", flex: 1 }}
          >
            終業報告がまだ提出されていません
          </span>
          <Link href="/report/end">
            <button
              style={{
                background: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 12px",
                cursor: "pointer",
              }}
            >
              終業報告する
            </button>
          </Link>
        </div>
      )}

      {/* ====== シーズンパス（全幅） ====== */}
      {(() => {
        const NODE_W = 52,
          MILESTONE_W = 76;
        const rewardMap = Object.fromEntries(rewards.map((r) => [r.level, r]));
        const levels = Array.from({ length: maxPassLevel }, (_, i) => i + 1);
        const totalTrackW = levels.reduce(
          (s, lv) => s + (rewardMap[lv] ? MILESTONE_W : NODE_W),
          0,
        );
        const passExpPct = Math.round((passExp / passExpToNext) * 100);
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000),
        );
        const endLabel = new Date(endDate).toLocaleDateString("ja-JP", {
          month: "long",
          day: "numeric",
        });
        const TYPE_CHIP: Partial<
          Record<SeasonRewardType, { label: string; bg: string; color: string }>
        > = {
          avatar_costume: { label: "衣装", bg: "#ede9fe", color: "#5b21b6" },
          physical: { label: "物理報酬", bg: "#fef3c7", color: "#92400e" },
        };
        let progressLineW = 0,
          accumulated = 0;
        for (const lv of levels) {
          const w = rewardMap[lv] ? MILESTONE_W : NODE_W;
          if (lv < passLevel) {
            accumulated += w;
            progressLineW = accumulated - w / 2;
          } else if (lv === passLevel) {
            progressLineW = accumulated + w / 2;
            break;
          } else break;
        }
        return (
          <div style={{ flexShrink: 0, padding: "8px 40px" }}>
            <div className="card" style={{ overflow: "hidden" }}>
              {/* バナー */}
              <div
                style={{
                  background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                  padding: "10px 16px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 8, opacity: 0.7, letterSpacing: 1 }}>
                    SEASON PASS
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>
                    {seasonName}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, flexShrink: 0 }}>
                  <div
                    style={{
                      background: "#f59e0b",
                      color: "#78350f",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 99,
                      whiteSpace: "nowrap",
                    }}
                  >
                    残り {daysLeft}日（{endLabel}まで）
                  </div>
                  <Link
                    href="/mypage/rewards"
                    style={{
                      padding: "3px 9px",
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      border: "1px solid rgba(255,255,255,0.4)",
                    }}
                  >
                    報酬一覧
                  </Link>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding: "3px 10px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: 8, opacity: 0.8 }}>パスLv.</div>
                  <div
                    style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.1 }}
                  >
                    {passLevel}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.8 }}>パスEXP</span>
                    <span style={{ fontSize: 9, opacity: 0.8 }}>
                      {passExp} / {passExpToNext}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(255,255,255,0.3)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${passExpPct}%`,
                        height: "100%",
                        background: "linear-gradient(90deg,#facc15,#f59e0b)",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
                <div style={{ fontSize: 10, opacity: 0.7, flexShrink: 0 }}>
                  → Lv.{passLevel + 1}
                </div>
              </div>
              {/* 報酬トラック */}
              <div
                style={{
                  overflowX: "auto",
                  display: "flex",
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    minWidth: `${totalTrackW + 20}px`,
                    position: "relative",
                    padding: "14px 10px 4px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 34,
                      left: 26,
                      width: totalTrackW,
                      height: 2,
                      background: "#e5e7eb",
                      zIndex: 0,
                    }}
                  />
                  {progressLineW > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 34,
                        left: 26,
                        width: progressLineW,
                        height: 2,
                        background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
                        zIndex: 1,
                      }}
                    />
                  )}
                  {levels.map((lv) => {
                    const reward = rewardMap[lv];
                    const isM = !!reward;
                    if (!isM)
                      return (
                        <div
                          key={lv}
                          style={{ width: NODE_W, flexShrink: 0 }}
                        />
                      );
                    const claimed = lv <= passLevel;
                    const isCur = lv === passLevel + 1;
                    const chip = TYPE_CHIP[reward.type as SeasonRewardType];
                    return (
                      <div
                        key={lv}
                        style={{
                          width: MILESTONE_W,
                          flexShrink: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: claimed
                              ? "#4f46e5"
                              : isCur
                                ? "#e0e7ff"
                                : "white",
                            border: isCur
                              ? "2px solid #4f46e5"
                              : claimed
                                ? "none"
                                : "2px solid #c4b5fd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: claimed ? 16 : 18,
                            color: claimed
                              ? "white"
                              : isCur
                                ? "#4f46e5"
                                : "#9ca3af",
                            boxShadow: isCur
                              ? "0 0 0 3px #e0e7ff"
                              : claimed
                                ? "none"
                                : "0 0 0 3px #ede9fe",
                          }}
                        >
                          {reward.icon}
                        </div>
                        <span
                          style={{
                            fontSize: 8,
                            marginTop: 3,
                            fontWeight: 700,
                            color: isCur
                              ? "#4f46e5"
                              : claimed
                                ? "#9ca3af"
                                : "#374151",
                          }}
                        >
                          Lv.{lv}
                        </span>
                        {chip && (
                          <span
                            style={{
                              fontSize: 7,
                              padding: "1px 3px",
                              borderRadius: 3,
                              marginTop: 1,
                              background: chip.bg,
                              color: chip.color,
                              fontWeight: 700,
                            }}
                          >
                            {chip.label}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: 8,
                            textAlign: "center",
                            marginTop: 1,
                            color: claimed ? "#9ca3af" : "#374151",
                            lineHeight: 1.2,
                            maxWidth: MILESTONE_W - 4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {reward.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3カラムメインエリア */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 340px 1fr",
          gridTemplateRows: "auto 1fr",
          gap: 20,
          padding: "12px 40px 20px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* ====== 左: 本日のタスク ====== */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            gridRow: "1 / -1",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13 }}>
                本日のタスク
              </span>
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
                {completedCount}/{todayRepoCas.length} 完了
              </span>
            </div>
            {/* フィルタータブ */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["全て", "未完了", "完了"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    borderRadius: 99,
                    border: "none",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: taskFilter === f ? "#4f46e5" : "#f3f4f6",
                    color: taskFilter === f ? "white" : "#6b7280",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* タスクリスト */}
          <div className="scroll-y" style={{ flex: 1, padding: "4px 8px" }}>
            {todayRepoCas.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 8px",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: 11, marginBottom: 8 }}>
                  本日の始業報告はされていません。
                </p>
                <Link href="/report/start">
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: 11, padding: "5px 12px" }}
                  >
                    始業報告
                  </button>
                </Link>
              </div>
            ) : filteredRepoCas.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 8px",
                  color: "#9ca3af",
                  fontSize: 11,
                }}
              >
                該当するタスクがありません
              </div>
            ) : (
              filteredRepoCas.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div
                    key={rc.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      padding: "7px 4px",
                      borderBottom: "1px solid #f3f4f6",
                      position: "relative",
                    }}
                  >
                    {/* チェックボックス */}
                    <div
                      onClick={() => toggleTask(rc.id)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 1,
                        border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                        background: rc.isCompleted ? "#10b981" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        transition: "all 0.15s",
                        cursor: "pointer",
                      }}
                    >
                      {rc.isCompleted && (
                        <HiCheck style={{ width: 11, height: 11 }} />
                      )}
                    </div>
                    {/* コンテンツ */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* タイトル → XP */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            margin: 0,
                            fontWeight: 500,
                            lineHeight: 1.35,
                            color: rc.isCompleted ? "#9ca3af" : "#1f2937",
                            textDecoration: rc.isCompleted
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {rc.content}
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#10b981",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          → +{rc.xp}XP
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 2,
                          alignItems: "center",
                        }}
                      >
                        {proj && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: 99,
                              background: proj.color,
                              color: proj.textColor,
                            }}
                          >
                            {proj.name}
                          </span>
                        )}
                        <span style={{ fontSize: 9, color: "#9ca3af" }}>
                          {rc.label}
                        </span>
                        {rc.duration > 0 && (
                          <span style={{ fontSize: 9, color: "#9ca3af" }}>
                            {fmtDuration(rc.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* ⋯ ボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(rc);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#6b7280",
                        fontSize: 22,
                        lineHeight: 1,
                        padding: "0 4px",
                        flexShrink: 0,
                        letterSpacing: 1,
                      }}
                    >
                      ···
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* ボタン */}
          <div
            style={{
              padding: "6px 10px",
              display: "flex",
              gap: 6,
              flexShrink: 0,
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Link href="/report/start" style={{ flex: 1 }}>
              <button
                className="btn btn-primary"
                style={{ width: "100%", fontSize: 11, padding: "7px 4px" }}
              >
                始業報告
              </button>
            </Link>
            {hasStartReported ? (
              <Link href="/report/end" style={{ flex: 1 }}>
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    fontSize: 11,
                    padding: "7px 4px",
                    background: "#f59e0b",
                    color: "white",
                  }}
                >
                  終業報告
                </button>
              </Link>
            ) : (
              <div style={{ flex: 1 }}>
                <button
                  className="btn"
                  disabled
                  title="始業報告後に終業報告できます"
                  style={{
                    width: "100%",
                    fontSize: 11,
                    padding: "7px 4px",
                    background: "#e5e7eb",
                    color: "#9ca3af",
                    cursor: "not-allowed",
                  }}
                >
                  終業報告
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====== 中央: ユーザーステータス ====== */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 0,
            gridRow: "1 / -1",
          }}
        >
          {/* ゲームシーン */}
          {attendance !== "working" ? (
            /* ホームシーン (idle / departing / returning) */
            <div
              className="avatar-game-wrap"
              style={{
                height: 160,
                flex: "none",
                background: `linear-gradient(180deg, ${weather.skyColor} 0%, ${weather.skyColor} 45%, #90EE90 45%, #90EE90 68%, #5a8a3c 68%)`,
              }}
            >
              {/* 天気の雲（速度・種類は天気に応じて変わる） */}
              <div
                style={{
                  position: "absolute",
                  top: "5%",
                  left: 0,
                  right: 0,
                  overflow: "hidden",
                  height: 26,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 180,
                    animation: `scroll-left-loop ${weather.cloudSpeed}s linear infinite`,
                    width: "max-content",
                  }}
                >
                  {weather.clouds.map((c, i) => (
                    <span
                      key={i}
                      style={{ fontSize: 18, flexShrink: 0, opacity: 0.85 }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {/* 天気バッジ */}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 10,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  background: "rgba(255,255,255,0.78)",
                  borderRadius: 6,
                  padding: "2px 7px",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  zIndex: 2,
                }}
              >
                <span>{weather.icon}</span>
                <span>{weather.label}</span>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "33%",
                  left: "5%",
                  fontSize: 28,
                }}
              >
                🌲
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "31%",
                  left: "16%",
                  fontSize: 22,
                }}
              >
                🌲
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "29%",
                  left: "25%",
                  fontSize: 16,
                }}
              >
                🌿
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "31%",
                  right: "6%",
                  fontSize: 40,
                }}
              >
                🏠
              </div>
              {/* アバター (中央揃えラッパー) */}
              <div
                style={{
                  position: "absolute",
                  bottom: "30%",
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {attendance === "departing" ? (
                  <DepartAvatar
                    avatarSrc={avatarSrc}
                    headCostume={headCostume}
                    bodyCostume={bodyCostume}
                    onComplete={() => setAttendance("working")}
                  />
                ) : attendance === "returning" ? (
                  <ReturnAvatar
                    avatarSrc={avatarSrc}
                    headCostume={headCostume}
                    bodyCostume={bodyCostume}
                    onComplete={() => {
                      const mins = workStartTime
                        ? Math.round(
                            (Date.now() - workStartTime.getTime()) / 60000,
                          )
                        : 0;
                      setWorkedMinutes(mins);
                      setAttendance("idle");
                      setShowWorkResult(true);
                    }}
                  />
                ) : (
                  <BobAvatar
                    avatarSrc={avatarSrc}
                    headCostume={headCostume}
                    bodyCostume={bodyCostume}
                  />
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "30%",
                  background: "#5a8a3c",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#1a1a2e",
                    background: "rgba(255,255,255,0.75)",
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {currentUser.name}
                </span>
                <button
                  onClick={() => setEditorOpen(true)}
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "none",
                    borderRadius: 6,
                    padding: "3px 6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#4f46e5",
                  }}
                >
                  <HiPencilAlt style={{ width: 11, height: 11 }} />
                  編集
                </button>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 32,
                  right: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 3,
                  zIndex: 2,
                }}
              >
                {activeEffectChips.map((eff) => (
                  <span
                    key={eff.key}
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      background: "rgba(255,255,255,0.88)",
                      color: eff.color,
                      borderRadius: 99,
                      padding: "1px 6px",
                    }}
                  >
                    {eff.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* 冒険シーン (working) */
            <div
              className="avatar-game-wrap"
              style={{
                height: 160,
                flex: "none",
                background: `linear-gradient(180deg, ${weather.skyColor} 0%, ${weather.skyColor} 45%, #90EE90 45%, #90EE90 68%, #5a8a3c 68%)`,
              }}
            >
              {/* 天気の雲（冒険シーンは少し速め） */}
              <div
                style={{
                  position: "absolute",
                  top: "6%",
                  left: 0,
                  right: 0,
                  overflow: "hidden",
                  height: 32,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 120,
                    animation: `scroll-left-loop ${Math.max(12, weather.cloudSpeed * 0.7)}s linear infinite`,
                    width: "max-content",
                  }}
                >
                  {weather.clouds.map((c, i) => (
                    <span key={i} style={{ fontSize: 20, flexShrink: 0 }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              {/* 天気バッジ */}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 10,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  background: "rgba(255,255,255,0.78)",
                  borderRadius: 6,
                  padding: "2px 7px",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  zIndex: 2,
                }}
              >
                <span>{weather.icon}</span>
                <span>{weather.label}</span>
              </div>
              {/* 遠景の山（ゆっくりスクロール・視差） */}
              <div
                style={{
                  position: "absolute",
                  bottom: "46%",
                  left: 0,
                  right: 0,
                  overflow: "hidden",
                  height: 30,
                  opacity: 0.35,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 90,
                    alignItems: "flex-end",
                    animation: "scroll-left-loop 16s linear infinite",
                    width: "max-content",
                  }}
                >
                  {[
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                    "🏔️",
                    "⛰️",
                  ].map((t, i) => (
                    <span key={i} style={{ fontSize: 20, flexShrink: 0 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* スクロールする木（前景） */}
              <div
                style={{
                  position: "absolute",
                  bottom: "28%",
                  left: 0,
                  right: 0,
                  overflow: "hidden",
                  height: 52,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 70,
                    alignItems: "flex-end",
                    animation: "scroll-left-loop 7s linear infinite",
                    width: "max-content",
                  }}
                >
                  {[
                    "🌲",
                    "🌿",
                    "🌲",
                    "🌲",
                    "🌿",
                    "🌲",
                    "🌲",
                    "🌿",
                    "🌲",
                    "🌿",
                    "🌲",
                    "🌲",
                    "🌿",
                    "🌲",
                    "🌲",
                    "🌿",
                  ].map((t, i) => (
                    <span key={i} style={{ fontSize: 28, flexShrink: 0 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {/* 地面 */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "30%",
                  background: "#5a8a3c",
                }}
              />
              {/* 歩くアバター */}
              <div
                style={{
                  position: "absolute",
                  bottom: "30%",
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <WalkAvatar
                  avatarSrc={avatarSrc}
                  headCostume={headCostume}
                  bodyCostume={bodyCostume}
                />
              </div>
              {/* 出勤中バッジ */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#1a1a2e",
                    background: "rgba(255,255,255,0.75)",
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {currentUser.name}
                </span>
                <button
                  onClick={() => setEditorOpen(true)}
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "none",
                    borderRadius: 6,
                    padding: "3px 6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#4f46e5",
                  }}
                >
                  <HiPencilAlt style={{ width: 11, height: 11 }} />
                  編集
                </button>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 11,
                    color: "white",
                    background: "#10b981",
                    padding: "2px 10px",
                    borderRadius: 99,
                  }}
                >
                  🏃 出勤中
                </span>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 32,
                  right: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 3,
                  zIndex: 2,
                }}
              >
                {activeEffectChips.map((eff) => (
                  <span
                    key={eff.key}
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      background: "rgba(255,255,255,0.88)",
                      color: eff.color,
                      borderRadius: 99,
                      padding: "1px 6px",
                    }}
                  >
                    {eff.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* XPバー + コスチューム効果 */}
          <div
            style={{
              padding: "8px 14px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#6b7280",
                marginBottom: 3,
              }}
            >
              <span style={{ fontWeight: 600 }}>EXP</span>
              <span>
                {currentUser.xp} / {currentUser.xpToNext}
              </span>
            </div>
            <div
              style={{
                height: 7,
                background: "#e5e7eb",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${xpPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#6366f1,#a855f7)",
                  borderRadius: 4,
                }}
              />
            </div>
            {/* 装備中コスチュームの効果 */}
            {activeEffectChips.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginTop: 5,
                  flexWrap: "wrap",
                }}
              >
                {activeEffectChips.map((eff) => (
                  <span
                    key={eff.key}
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: eff.color + "22",
                      color: eff.color,
                      borderRadius: 99,
                      padding: "1px 7px",
                      border: `1px solid ${eff.color}44`,
                    }}
                  >
                    {eff.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 本日の進捗サマリー */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              flexShrink: 0,
            }}
          >
            {[
              {
                Icon: HiClipboardList,
                label: "本日タスク",
                value: `${completedCount}/${todayRepoCas.length}`,
                color: "#4f46e5",
              },
              {
                Icon: HiBadgeCheck,
                label: "バッジ",
                value: `${acquiredBadges}個`,
                color: "#10b981",
              },
              {
                Icon: HiStar,
                label: "レベル",
                value: `Lv.${currentUser.level}`,
                color: "#f59e0b",
              },
            ].map(({ Icon, label, value, color }, i) => (
              <div
                key={label}
                style={{
                  padding: "10px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  borderRight: i < 2 ? "1px solid #e5e7eb" : "none",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <Icon style={{ width: 16, height: 16, color }} />
                <span
                  style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}
                >
                  {value}
                </span>
                <span style={{ fontSize: 9, color: "#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* 出退勤ボタン */}
          <div
            style={{
              padding: "14px 20px 16px",
              display: "flex",
              gap: 12,
              borderTop: "1px solid #e5e7eb",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleCheckIn}
              disabled={attendance !== "idle"}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background: attendance === "idle" ? "#fef9c3" : "#f3f4f6",
                color: attendance === "idle" ? "#78350f" : "#9ca3af",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.5,
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
                flex: 1,
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background: attendance === "working" ? "#dbeafe" : "#f3f4f6",
                color: attendance === "working" ? "#1e40af" : "#9ca3af",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.5,
                cursor: attendance === "working" ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {attendance === "returning" ? "帰宅中…" : "退 勤"}
            </button>
          </div>
        </div>

        {/* ====== 右: バッジ ====== */}
        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            overflow: "hidden",
            minHeight: 292,
          }}
        >
          {/* 左: バッジ一覧 */}
          <div
            style={{
              padding: "10px 12px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid #e5e7eb",
            }}
          >
            {/* ヘッダー */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 12, color: "#1a1a2e" }}>
                バッジ一覧
              </span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {(["bronze", "silver", "gold"] as const).map((t) => {
                  const cnt = badges.filter((b) => b.tier === t).length;
                  return (
                    <span
                      key={t}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 9,
                        color: "#6b7280",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: TIER_STYLE[t].bg,
                          display: "inline-block",
                        }}
                      />
                      {cnt}
                    </span>
                  );
                })}
              </div>
            </div>
            {/* グリッド */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              {(() => {
                const COLS = 4;
                const visibleBadges = showAllBadges
                  ? badges
                  : badges.slice(0, COLS * 3);
                return (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                        gap: 7,
                        alignContent: "start",
                      }}
                    >
                      {visibleBadges.map((b) => {
                        const iconInfo = BADGE_ICON_MAP[b.name];
                        const ts = b.tier ? TIER_STYLE[b.tier] : null;
                        const isSelected = selectedBadge?.id === b.id;
                        return (
                          <div
                            key={b.id}
                            title={`${b.name}${b.tier ? ` [${TIER_STYLE[b.tier].label}]` : ""}: ${b.description}`}
                            onClick={() => setSelectedBadge(b)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 4,
                              cursor: "pointer",
                              padding: 3,
                              borderRadius: 8,
                              background: isSelected
                                ? "rgba(79,70,229,0.08)"
                                : "transparent",
                              border: `2px solid ${isSelected ? "#4f46e5" : "transparent"}`,
                              transition: "all 0.15s",
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                border: `2px solid ${ts ? ts.border : "#e5e7eb"}`,
                                background: ts ? ts.bg : "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: b.acquired ? 1 : 0.35,
                              }}
                            >
                              {iconInfo ? (
                                <iconInfo.Icon
                                  style={{
                                    width: 18,
                                    height: 18,
                                    color: ts ? "white" : "#9ca3af",
                                  }}
                                />
                              ) : (
                                <span style={{ fontSize: 16 }}>{b.icon}</span>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                textAlign: "center",
                                color: ts ? ts.labelColor : "#9ca3af",
                              }}
                            >
                              {b.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {badges.length > COLS * 3 && (
                      <div style={{ textAlign: "center", marginTop: 4 }}>
                        <button
                          onClick={() => setShowAllBadges((v) => !v)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#9ca3af",
                            padding: "2px 12px",
                          }}
                        >
                          {showAllBadges ? (
                            <HiChevronUp style={{ width: 14, height: 14 }} />
                          ) : (
                            <HiChevronDown style={{ width: 14, height: 14 }} />
                          )}
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* 右: バッジ詳細 */}
          <div
            style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedBadge ? (
              (() => {
                const b = selectedBadge;
                const iconInfo = BADGE_ICON_MAP[b.name];
                const currentTierStyle = b.tier ? TIER_STYLE[b.tier] : null;
                const currentTierIndex = b.tier
                  ? TIER_ORDER.indexOf(b.tier)
                  : -1;
                const nextTier =
                  currentTierIndex >= 0 &&
                  currentTierIndex < TIER_ORDER.length - 1
                    ? TIER_ORDER[currentTierIndex + 1]
                    : null;
                const isMaxTier = b.tier === "gold";
                const hasProgress =
                  b.nextTierProgress !== undefined &&
                  b.nextTierGoal !== undefined &&
                  b.nextTierGoal > 0 &&
                  nextTier !== null;
                const pct = hasProgress
                  ? Math.min(
                      Math.round((b.nextTierProgress! / b.nextTierGoal!) * 100),
                      100,
                    )
                  : 0;
                return (
                  <>
                    {/* ヘッダー */}
                    <div
                      style={{
                        background: currentTierStyle
                          ? currentTierStyle.bg
                          : "#f3f4f6",
                        padding: "12px 14px",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {b.acquired && b.exp !== undefined && (
                        <div
                          style={{
                            alignSelf: "flex-start",
                            fontSize: 10,
                            color: "rgba(255,255,255,0.8)",
                          }}
                        >
                          EXP: {b.exp.toLocaleString()}
                        </div>
                      )}
                      {currentTierStyle && (
                        <span
                          style={{
                            alignSelf: "flex-end",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          {currentTierStyle.label}
                        </span>
                      )}
                      {iconInfo && (
                        <iconInfo.Icon
                          style={{ width: 32, height: 32, color: "white" }}
                        />
                      )}
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: "white",
                          textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      >
                        {b.name}
                      </div>
                    </div>
                    {/* コンテンツ */}
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {/* 次ティアへの進捗 */}
                      <div
                        style={{
                          background: "#f9fafb",
                          borderRadius: 8,
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#374151",
                            }}
                          >
                            {nextTier
                              ? `next : ${TIER_STYLE[nextTier].label}`
                              : isMaxTier
                                ? "蓄積EXP"
                                : "初回取得条件"}
                          </span>
                          {hasProgress && (
                            <span style={{ fontSize: 9, color: "#6b7280" }}>
                              {b.nextTierProgress}/{b.nextTierGoal}
                            </span>
                          )}
                          {isMaxTier && b.exp !== undefined && (
                            <span style={{ fontSize: 9, color: "#6b7280" }}>
                              {b.exp.toLocaleString()} EXP
                            </span>
                          )}
                        </div>
                        {hasProgress && (
                          <div
                            style={{
                              height: 5,
                              background: "#e5e7eb",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                borderRadius: 3,
                                background: nextTier
                                  ? TIER_STYLE[nextTier].bg
                                  : "#10b981",
                              }}
                            />
                          </div>
                        )}
                        {isMaxTier && (
                          <div
                            style={{
                              fontSize: 9,
                              color: "#10b981",
                              marginTop: 3,
                            }}
                          >
                            ゴールド取得後も経験値を蓄積中
                          </div>
                        )}
                      </div>
                      {/* 取得履歴 */}
                      {b.tierHistory && b.tierHistory.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#6b7280",
                              marginBottom: 4,
                            }}
                          >
                            取得履歴
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                            }}
                          >
                            {[...b.tierHistory].reverse().map((h, i) => {
                              const ts = TIER_STYLE[h.tier];
                              return (
                                <div
                                  key={i}
                                  style={{
                                    padding: "4px 6px",
                                    borderRadius: 5,
                                    background: "#f9fafb",
                                    borderLeft: `3px solid ${ts.bg}`,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <span
                                      style={{
                                        flex: 1,
                                        fontSize: 10,
                                        fontWeight: 600,
                                        color: ts.labelColor,
                                      }}
                                    >
                                      {ts.label}バッジ取得
                                    </span>
                                    <span
                                      style={{ fontSize: 9, color: "#9ca3af" }}
                                    >
                                      {h.date}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#9ca3af",
                  fontSize: 11,
                }}
              >
                バッジを選択してください
              </div>
            )}
          </div>
        </div>

        {/* ====== ミッション（横長） ====== */}
        {(() => {
          const tabMissions = missions.filter((m) => m.type === "daily");
          const doneCount = tabMissions.filter((m) => m.completed).length;
          return (
            <div
              className="card"
              style={{
                padding: "10px 16px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0,
                gridColumn: "3",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 12, color: "#1a1a2e" }}
                >
                  デイリーミッション
                </span>
                <span
                  style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}
                >
                  {doneCount}/{tabMissions.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                  flexWrap: "wrap",
                }}
              >
                {tabMissions.map((m) => {
                  const pct = Math.min(
                    Math.round((m.progress / m.goal) * 100),
                    100,
                  );
                  const done = m.completed;
                  return (
                    <div
                      key={m.id}
                      style={{
                        opacity: done ? 0.72 : 1,
                        flex: "1 1 0",
                        minWidth: 180,
                        background: done ? "#f9fafb" : "#fafafa",
                        borderRadius: 8,
                        padding: "8px 10px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: done ? "#9ca3af" : "#1f2937",
                              textDecoration: done ? "line-through" : "none",
                              lineHeight: 1.3,
                            }}
                          >
                            {m.title}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            alignItems: "flex-end",
                            flexShrink: 0,
                          }}
                        >
                          {m.reward > 0 && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                color: "#ea580c",
                                background: "#fff7ed",
                                padding: "1px 6px",
                                borderRadius: 99,
                                whiteSpace: "nowrap",
                              }}
                            >
                              +{m.reward} XP
                            </span>
                          )}
                          {(m.passExpReward ?? 0) > 0 && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "#1e40af",
                                background: "#eff6ff",
                                padding: "1px 6px",
                                borderRadius: 99,
                                whiteSpace: "nowrap",
                              }}
                            >
                              +{m.passExpReward} PEXP
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          paddingLeft: 0,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: "#e5e7eb",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              borderRadius: 2,
                              background: done
                                ? "#10b981"
                                : "linear-gradient(90deg,#4f46e5,#7c3aed)",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 8,
                            color: "#9ca3af",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.progress}/{m.goal}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {tabMissions.length === 0 && (
                  <div
                    style={{
                      fontSize: 10,
                      color: "#9ca3af",
                      textAlign: "center",
                      padding: "8px 0",
                      width: "100%",
                    }}
                  >
                    ミッションはありません
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* タスク詳細モーダル */}
      {selectedTask && (
        <TaskDetailModal
          rc={selectedTask}
          proj={projects.find((p) => p.id === selectedTask.projectId)}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* 退勤結果モーダル */}
      {showWorkResult && (
        <WorkResultModal
          workedMinutes={workedMinutes}
          completedCount={completedCount}
          totalTasks={todayRepoCas.length}
          earnedXp={todayRepoCas
            .filter((r) => r.isCompleted)
            .reduce((s, r) => s + r.xp, 0)}
          onClose={() => setShowWorkResult(false)}
        />
      )}

      {/* アバター編集モーダル */}
      {editorOpen && (
        <AvatarEditor
          initialAvatar={avatarKey}
          initialHeadCostume={headCostume}
          initialBodyCostume={bodyCostume}
          initialOmamori={omamori}
          onConfirm={(a, h, b, o) => {
            setAvatarKey(a);
            setHeadCostume(h);
            setBodyCostume(b);
            setOmamori(o);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}

// ---- タスク詳細モーダル ----
type ProjectInfo = {
  name: string;
  color: string;
  textColor: string;
  icon: string;
};

function TaskDetailModal({
  rc,
  proj,
  onClose,
}: {
  rc: RepoCa;
  proj: ProjectInfo | undefined;
  onClose: () => void;
}) {
  const rows = [
    { label: "プロジェクト", value: proj?.name ?? "—" },
    { label: "タスク種別", value: rc.taskType },
    { label: "ラベル", value: rc.label },
    { label: "実装スコープ", value: rc.implScope },
    { label: "工数", value: rc.duration > 0 ? `${rc.duration}分` : "未記入" },
    { label: "獲得XP", value: `+${rc.xp} XP` },
    { label: "ステータス", value: rc.isCompleted ? "✓ 完了" : "未完了" },
  ];
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          width: 320,
          maxWidth: "92vw",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            padding: "14px 18px",
          }}
        >
          {proj && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 99,
                background: proj.color,
                color: proj.textColor,
                marginBottom: 6,
                display: "inline-block",
              }}
            >
              {proj.icon} {proj.name}
            </span>
          )}
          <p
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "white",
              margin: "4px 0 0",
              lineHeight: 1.4,
            }}
          >
            {rc.content}
          </p>
        </div>
        {/* 詳細テーブル */}
        <div style={{ padding: "12px 18px 8px" }}>
          {rows.map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 0",
                borderBottom: "1px solid #f3f4f6",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#6b7280", fontWeight: 600 }}>
                {r.label}
              </span>
              <span
                style={{
                  color:
                    r.label === "ステータス"
                      ? rc.isCompleted
                        ? "#10b981"
                        : "#9ca3af"
                      : r.label === "獲得XP"
                        ? "#4f46e5"
                        : "#1f2937",
                  fontWeight: r.label === "獲得XP" ? 700 : 500,
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: "8px 18px 16px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: "#f3f4f6",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              color: "#374151",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
