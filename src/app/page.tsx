"use client";

import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { currentUser, badges } from "@/lib/mock-data";
import { useMission } from "@/contexts/MissionContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import type { SeasonRewardType, RepoCa } from "@/types";
import { HiFlag, HiCheck, HiPencilAlt } from "react-icons/hi";
import {
  AvatarWithCostume,
  OMAMORI_EFFECTS,
} from "@/components/AvatarWithCostume";
import type { HeadCostume, BodyCostume } from "@/components/AvatarWithCostume";
import { useAvatar } from "@/contexts/AvatarContext";
import { AvatarEditor } from "@/components/AvatarEditor";
import gsap from "gsap";
import { useRepoCa } from "@/contexts/RepoCaContext";

import { fmtDuration } from "@/lib/utils";
import { useNews } from "@/contexts/NewsContext";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const TYPE_CHIP: Partial<
  Record<SeasonRewardType, { label: string; bg: string; color: string }>
> = {
  avatar_costume: { label: "衣装", bg: "#ede9fe", color: "#5b21b6" },
  physical: { label: "物理報酬", bg: "#fef3c7", color: "#92400e" },
};

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
  size = 80,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  size?: number;
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
        size={size}
      />
    </div>
  );
}

function DepartAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
  onComplete,
  size = 80,
  containerW = 340,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  onComplete: () => void;
  size?: number;
  containerW?: number;
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
        x: containerW * 1.2,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref}>
      <AvatarWithCostume
        avatarSrc={avatarSrc}
        headCostume={headCostume}
        bodyCostume={bodyCostume}
        size={size}
      />
    </div>
  );
}

function ReturnAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
  onComplete,
  size = 80,
  containerW = 340,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  onComplete: () => void;
  size?: number;
  containerW?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { x: -containerW, opacity: 0, transformPerspective: 400 });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref}>
      <AvatarWithCostume
        avatarSrc={avatarSrc}
        headCostume={headCostume}
        bodyCostume={bodyCostume}
        size={size}
      />
    </div>
  );
}

function WalkAvatar({
  avatarSrc,
  headCostume,
  bodyCostume,
  size = 80,
}: {
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  size?: number;
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
        size={size}
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
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
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
            { label: "勤務時間", value: timeStr, icon: "⏱️", color: "#007aff" },
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
                <span style={{ fontSize: 14, color: "#6b7280" }}>{label}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color }}>
                {value}
              </span>
            </div>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: "100%" }}
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

type FilterType = "全て" | "未完了" | "完了";
type AttendanceState = "idle" | "departing" | "working" | "returning";

export default function Home() {
  const { newsList } = useNews();
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
  const [attendance, setAttendance] = useState<AttendanceState>(() => {
    if (typeof window === "undefined") return "idle";
    const saved = localStorage.getItem(
      "mitac_attendance",
    ) as AttendanceState | null;
    if (saved === "departing") return "working";
    if (saved === "returning") return "idle";
    return saved ?? "idle";
  });
  const [workStartTime, setWorkStartTime] = useState<Date | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("mitac_work_start");
    return saved ? new Date(saved) : null;
  });

  // 出勤ステータスが変わったら localStorage に保存
  useEffect(() => {
    localStorage.setItem("mitac_attendance", attendance);
  }, [attendance]);

  // workStartTime が変わったら localStorage に保存
  useEffect(() => {
    if (workStartTime) {
      localStorage.setItem("mitac_work_start", workStartTime.toISOString());
    } else {
      localStorage.removeItem("mitac_work_start");
    }
  }, [workStartTime]);

  // シーズンパス報酬トラックのコンテナ幅追跡
  const spTrackRef = useRef<HTMLDivElement>(null);
  const [spTrackW, setSpTrackW] = useState(0);
  useEffect(() => {
    const el = spTrackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSpTrackW(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    completionType,
    setCompletionType,
    resetDailyReports,
    showEndOfWork,
    setShowEndOfWork,
  } = useRepoCa();
  const { missions } = useMission();
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [missionTab, setMissionTab] = useState<
    "daily" | "monthly" | "unlimited"
  >("daily");
  const [hoveredRewardLv, setHoveredRewardLv] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<RepoCa | null>(null);
  const [showWorkResult, setShowWorkResult] = useState(false);
  const [workedMinutes, setWorkedMinutes] = useState(0);
  const [weather, setWeather] = useState<WeatherInfo>(DEFAULT_WEATHER);
  const gameWrapRef = useRef<HTMLDivElement>(null);
  const [gameSize, setGameSize] = useState({ w: 340, h: 200 });

  // ゲームエリアのサイズを追跡してアバターサイズを可変に
  useEffect(() => {
    const el = gameWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setGameSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const avatarSize = Math.round(
    Math.min(gameSize.w * 0.36, gameSize.h * 0.38, 180),
  );

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
    if (!hasEndReported) return;
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
            fontSize: 14,
            fontWeight: 700,
            color: "#007aff",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          お知らせ
          <Link
            href="/news"
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#007aff",
              border: "1px solid #007aff",
              borderRadius: 4,
              padding: "1px 6px",
              lineHeight: 1.4,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            一覧
          </Link>
        </span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="news-ticker-inner">
            {[...newsList, ...newsList].map((n, i) => (
              <span key={i} style={{ marginRight: 40 }}>
                ◇ {n.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ====== シーズンパス（全幅） ====== */}
      {(() => {
        const milestoneCount = rewards.length;
        const EDGE_PAD = 10;
        const MILESTONE_W = 80;
        const availW = spTrackW > 0 ? spTrackW - 2 * EDGE_PAD : 0;
        const gapW =
          availW > 0
            ? (availW - milestoneCount * MILESTONE_W) / (milestoneCount - 1)
            : 0;
        const milestoneStep = MILESTONE_W + gapW; // マイルストーン中心間の距離
        const passExpPct = Math.round((passExp / passExpToNext) * 100);
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000),
        );
        const endLabel = new Date(endDate).toLocaleDateString("ja-JP", {
          month: "long",
          day: "numeric",
        });
        const firstMilCenterX = EDGE_PAD + MILESTONE_W / 2;
        // 進捗ライン: マイルストーン間を補間して現在レベルの中心Xを算出
        let currentLevelCenterX = firstMilCenterX;
        for (let i = 0; i < rewards.length; i++) {
          if (rewards[i].level <= passLevel) {
            currentLevelCenterX = firstMilCenterX + i * milestoneStep;
          }
          if (
            i < rewards.length - 1 &&
            rewards[i].level < passLevel &&
            rewards[i + 1].level > passLevel
          ) {
            const t =
              (passLevel - rewards[i].level) /
              (rewards[i + 1].level - rewards[i].level);
            currentLevelCenterX =
              firstMilCenterX + i * milestoneStep + t * milestoneStep;
            break;
          }
        }
        const progressLineW = Math.max(
          0,
          currentLevelCenterX - firstMilCenterX,
        );
        const showProgress = progressLineW > 0;
        return (
          <div style={{ flexShrink: 0, padding: "8px 40px" }}>
            <div className="card" style={{ overflow: "visible" }}>
              {/* バナー */}
              <div
                style={{
                  background: "#007aff",
                  padding: "10px 16px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: 14, opacity: 0.7, letterSpacing: 1 }}>
                    SEASON PASS
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {seasonName}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      background: "#007aff",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 800,
                      padding: "3px 9px",
                      borderRadius: 99,
                      whiteSpace: "nowrap",
                    }}
                  >
                    残り {daysLeft}日（{endLabel}まで）
                  </div>
                  <button
                    onClick={() => setShowRewardModal(true)}
                    style={{
                      padding: "3px 9px",
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      border: "1px solid rgba(255,255,255,0.4)",
                      cursor: "pointer",
                    }}
                  >
                    シーズン報酬一覧
                  </button>
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
                  <div style={{ fontSize: 14, opacity: 0.8 }}>パスLv.</div>
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
                    <span style={{ fontSize: 14, opacity: 0.8 }}>パスEXP</span>
                    <span style={{ fontSize: 14, opacity: 0.8 }}>
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
                <div style={{ fontSize: 14, opacity: 0.7, flexShrink: 0 }}>
                  → Lv.{passLevel + 1}
                </div>
              </div>
              {/* 報酬トラック */}
              <div ref={spTrackRef} style={{ overflow: "visible" }}>
                {spTrackW > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: gapW,
                      width: "100%",
                      position: "relative",
                      padding: "14px 10px 4px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 34,
                        left: firstMilCenterX,
                        right: EDGE_PAD + MILESTONE_W / 2,
                        height: 2,
                        background: "#e5e7eb",
                        zIndex: 0,
                      }}
                    />
                    {showProgress && (
                      <div
                        style={{
                          position: "absolute",
                          top: 34,
                          left: firstMilCenterX,
                          width: progressLineW,
                          height: 2,
                          background: "#007aff",
                          zIndex: 1,
                        }}
                      />
                    )}
                    {rewards.map((reward) => {
                      const lv = reward.level;
                      const claimed = lv <= passLevel;
                      const isCur = lv === passLevel + 1;
                      const chip = TYPE_CHIP[reward.type as SeasonRewardType];
                      const hovered = hoveredRewardLv === lv;
                      return (
                        <div
                          key={lv}
                          style={{
                            width: MILESTONE_W,
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            position: "relative",
                            zIndex: 2,
                          }}
                        >
                          {/* ホバートゥールチップ */}
                          {hovered && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: "calc(100% + 6px)",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "#1a1a2e",
                                color: "white",
                                padding: "5px 9px",
                                borderRadius: 7,
                                fontSize: 12,
                                whiteSpace: "nowrap",
                                zIndex: 20,
                                pointerEvents: "none",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                alignItems: "center",
                              }}
                            >
                              {chip && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: chip.bg,
                                    color: chip.color,
                                    padding: "1px 5px",
                                    borderRadius: 3,
                                  }}
                                >
                                  {chip.label}
                                </span>
                              )}
                              <span style={{ fontWeight: 700 }}>
                                {reward.name}
                              </span>
                            </div>
                          )}
                          <div
                            onMouseEnter={() => setHoveredRewardLv(lv)}
                            onMouseLeave={() => setHoveredRewardLv(null)}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: claimed
                                ? "#007aff"
                                : isCur
                                  ? "#e0e7ff"
                                  : "white",
                              border: isCur
                                ? "2px solid #007aff"
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
                                  ? "#007aff"
                                  : "#9ca3af",
                              boxShadow: isCur
                                ? "0 0 0 3px #e0e7ff"
                                : claimed
                                  ? "none"
                                  : "0 0 0 3px #ede9fe",
                              cursor: "default",
                            }}
                          >
                            {reward.icon}
                          </div>
                          <span
                            style={{
                              fontSize: 12,
                              marginTop: 3,
                              fontWeight: 700,
                              color: isCur
                                ? "#007aff"
                                : claimed
                                  ? "#9ca3af"
                                  : "#374151",
                            }}
                          >
                            Lv.{lv}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
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
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                本日のタスク
              </span>
              <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>
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
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: taskFilter === f ? "#007aff" : "#f3f4f6",
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
                <p style={{ fontSize: 14 }}>本日の始業報告はされていません。</p>
              </div>
            ) : filteredRepoCas.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 8px",
                  color: "#9ca3af",
                  fontSize: 14,
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
                            fontSize: 14,
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
                            fontSize: 14,
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
                              fontSize: 14,
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
                        <span style={{ fontSize: 14, color: "#9ca3af" }}>
                          {rc.label}
                        </span>
                        {rc.duration > 0 && (
                          <span style={{ fontSize: 14, color: "#9ca3af" }}>
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
            {hasStartReported || hasEndReported || attendance !== "working" ? (
              <div style={{ flex: 1 }}>
                <button
                  className="btn"
                  disabled
                  style={{
                    width: "100%", fontSize: 14, padding: "7px 4px",
                    background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed",
                  }}
                >
                  始業報告
                </button>
              </div>
            ) : (
              <Link href="/report/start" style={{ flex: 1 }}>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: 14, padding: "7px 4px" }}
                >
                  始業報告
                </button>
              </Link>
            )}
            {hasStartReported && hasOvertimeReported ? (
              <Link href="/report/end" style={{ flex: 1 }}>
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    fontSize: 14,
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
                    fontSize: 14,
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
              ref={gameWrapRef}
              className="avatar-game-wrap"
              style={{
                flex: 1,
                minHeight: 0,
                background: `linear-gradient(180deg, ${weather.skyColor} 0%, ${weather.skyColor} 45%, #90EE90 45%, #90EE90 82%, #5a8a3c 82%)`,
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
                  fontSize: 14,
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
                  bottom: "21%",
                  left: "5%",
                  fontSize: 28,
                }}
              >
                🌲
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "19%",
                  left: "16%",
                  fontSize: 22,
                }}
              >
                🌲
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "17%",
                  left: "25%",
                  fontSize: 16,
                }}
              >
                🌿
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "19%",
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
                  bottom: "18%",
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
                    size={avatarSize}
                    containerW={gameSize.w}
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
                      resetDailyReports();
                      setShowEndOfWork(true);
                      setTimeout(() => setShowEndOfWork(false), 8000);
                    }}
                    size={avatarSize}
                    containerW={gameSize.w}
                  />
                ) : (
                  <BobAvatar
                    avatarSrc={avatarSrc}
                    headCostume={headCostume}
                    bodyCostume={bodyCostume}
                    size={avatarSize}
                  />
                )}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "18%",
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
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#007aff",
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
                      fontSize: 14,
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
              ref={gameWrapRef}
              className="avatar-game-wrap"
              style={{
                flex: 1,
                minHeight: 0,
                background: `linear-gradient(180deg, ${weather.skyColor} 0%, ${weather.skyColor} 45%, #90EE90 45%, #90EE90 82%, #5a8a3c 82%)`,
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
                  fontSize: 14,
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
                  bottom: "34%",
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
                  bottom: "16%",
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
                  height: "18%",
                  background: "#5a8a3c",
                }}
              />
              {/* 歩くアバター */}
              <div
                style={{
                  position: "absolute",
                  bottom: "18%",
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
                  size={avatarSize}
                />
              </div>
              {/* 出勤中バッジ */}
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                  zIndex: 2,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#007aff",
                    }}
                  >
                    <HiPencilAlt style={{ width: 11, height: 11 }} />
                    編集
                  </button>
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
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
                      fontSize: 14,
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
              disabled={attendance !== "working" || !hasEndReported}
              title={
                attendance === "working" && !hasEndReported
                  ? "終業報告を完了してから退勤できます"
                  : undefined
              }
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background:
                  attendance === "working" && hasEndReported
                    ? "#dbeafe"
                    : "#f3f4f6",
                color:
                  attendance === "working" && hasEndReported
                    ? "#1e40af"
                    : "#9ca3af",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: 0.5,
                cursor:
                  attendance === "working" && hasEndReported
                    ? "pointer"
                    : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {attendance === "returning" ? "帰宅中…" : "退 勤"}
            </button>
          </div>
        </div>

        {/* ====== ミッション（横長） ====== */}
        {(() => {
          const MISSION_TABS = [
            { key: "daily" as const, label: "デイリー" },
            { key: "monthly" as const, label: "今月" },
            { key: "unlimited" as const, label: "無期限" },
          ];
          const tabMissions = missions.filter((m) => m.type === missionTab);
          const doneCount = tabMissions.filter((m) => m.completed).length;
          return (
            <div
              className="card"
              style={{
                padding: "10px 16px",
                display: "flex",
                flexDirection: "column",
                gridColumn: "3",
                gridRow: "1 / -1",
              }}
            >
              {/* ヘッダー行 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}
                >
                  ミッション
                </span>
                <Link
                  href="/mypage/missions"
                  style={{ textDecoration: "none" }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#007aff",
                      background: "#e8f2ff",
                      padding: "2px 16px",
                      borderRadius: 99,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    一覧
                  </span>
                </Link>
              </div>
              {/* タブ切り替え */}
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {MISSION_TABS.map((tab) => {
                  const active = missionTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setMissionTab(tab.key)}
                      style={{
                        padding: "3px 12px",
                        borderRadius: 99,
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: active ? 700 : 400,
                        background: active ? "#007aff" : "#f3f4f6",
                        color: active ? "white" : "#6b7280",
                        transition: "all 0.15s",
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                <span
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    alignSelf: "center",
                    marginLeft: 4,
                  }}
                >
                  {doneCount}/{tabMissions.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
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
                        width: "100%",
                        background: done ? "#f9fafb" : "#fafafa",
                        borderRadius: 6,
                        padding: "4px 8px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 2,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 14,
                            fontWeight: 700,
                            color: done ? "#9ca3af" : "#1f2937",
                            textDecoration: done ? "line-through" : "none",
                            lineHeight: 1.2,
                          }}
                        >
                          {m.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 4,
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {m.reward > 0 && (
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "#ea580c",
                                background: "#fff7ed",
                                padding: "0px 5px",
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
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#1e40af",
                                background: "#eff6ff",
                                padding: "0px 5px",
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
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 3,
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
                              background: "#007aff",
                              transition: "width 0.3s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 14,
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
                      fontSize: 14,
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
          disableOmamori={attendance === "working"}
          onConfirm={(a, h, b, o) => {
            setAvatarKey(a);
            setHeadCostume(h);
            setBodyCostume(b);
            setOmamori(o);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {/* シーズン報酬一覧モーダル */}
      {showRewardModal &&
        createPortal(
          <div
            onClick={() => setShowRewardModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100dvh",
              background: "rgba(0,0,0,0.5)",
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 20,
                width: "100%",
                maxWidth: 480,
                maxHeight: "80dvh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "#007aff",
                  padding: "16px 20px",
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.75)",
                      marginBottom: 2,
                    }}
                  >
                    {seasonName}
                  </div>
                  <div
                    style={{ fontSize: 16, fontWeight: 800, color: "white" }}
                  >
                    シーズン報酬一覧
                  </div>
                </div>
                <button
                  onClick={() => setShowRewardModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "white",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ overflowY: "auto", padding: "12px 16px 24px" }}>
                {rewards.map((reward) => {
                  const chip = TYPE_CHIP[reward.type];
                  const claimed = reward.level <= passLevel;
                  return (
                    <div
                      key={reward.level}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 10,
                        marginBottom: 6,
                        background: claimed ? "#f0fdf4" : "white",
                        border: `1px solid ${claimed ? "#bbf7d0" : "#e5e7eb"}`,
                        opacity: claimed ? 0.75 : 1,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: claimed ? "#007aff" : "#ede9fe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                        }}
                      >
                        {claimed ? "✓" : reward.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 2,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#007aff",
                            }}
                          >
                            Lv.{reward.level}
                          </span>
                          {chip && (
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 4,
                                background: chip.bg,
                                color: chip.color,
                              }}
                            >
                              {chip.label}
                            </span>
                          )}
                          {claimed && (
                            <span
                              style={{
                                fontSize: 14,
                                color: "#10b981",
                                fontWeight: 700,
                                marginLeft: "auto",
                              }}
                            >
                              獲得済み
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: claimed ? "#6b7280" : "#1f2937",
                            fontWeight: 500,
                          }}
                        >
                          {reward.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* 報告完了モーダル */}
      {completionType &&
        createPortal(
          <div
            onClick={() => setCompletionType(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 20,
                width: "100%",
                maxWidth: 360,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 24px 24px",
                gap: 12,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 52 }}>
                {completionType === "start"
                  ? "🌅"
                  : completionType === "overtime"
                    ? "🌙"
                    : "🎉"}
              </div>
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: "#1a1a2e",
                  margin: 0,
                }}
              >
                提出完了！
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  margin: 0,
                  lineHeight: 1.8,
                }}
              >
                {completionType === "start"
                  ? "始業報告が完了しました。今日も一日頑張りましょう！"
                  : completionType === "overtime"
                    ? "残業報告が完了しました。"
                    : "終業報告が完了しました。お疲れ様でした！"}
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 8, width: "100%" }}
                onClick={() => setCompletionType(null)}
              >
                OK
              </button>
            </div>
          </div>,
          document.body,
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
            background: "#007aff",
            padding: "14px 18px",
          }}
        >
          {proj && (
            <span
              style={{
                fontSize: 14,
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
                fontSize: 14,
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
                        ? "#007aff"
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
              fontSize: 14,
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
