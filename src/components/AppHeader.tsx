"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiExclamation, HiLogout } from "react-icons/hi";
import { currentUser } from "@/lib/mock-data";
import { useAvatar } from "@/contexts/AvatarContext";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useRole } from "@/contexts/RoleContext";
import { AvatarWithCostume } from "@/components/AvatarWithCostume";
import { AvatarEditor } from "@/components/AvatarEditor";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const AVATAR_SRC: Record<string, string> = {
  fox:     `${BASE}/avatars/avatar_fox.svg`,
  cat:     `${BASE}/avatars/avatar_cat.svg`,
  doragon: `${BASE}/avatars/avatar_doragon.svg`,
};

export default function AppHeader() {
  const { avatarKey, headCostume, bodyCostume, omamori, setAvatarKey, setHeadCostume, setBodyCostume, setOmamori } = useAvatar();
  const { passLevel, passExp, passExpToNext } = useSeasonPass();
  const { hasStartReported, hasOvertimeReported, hasEndReported, showEndOfWork, resetDailyReports } = useRepoCa();
  const { clearRole } = useRole();
  const router = useRouter();
  const [showEditor, setShowEditor] = useState(false);

  const handleLogout = () => {
    resetDailyReports();
    sessionStorage.removeItem("mitac_end_report_draft");
    sessionStorage.removeItem("mitac_start_report_draft");
    clearRole();
    router.push("/");
  };
  const xpPct     = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const passExpPct = Math.round((passExp / passExpToNext) * 100);
  const avatarSrc = AVATAR_SRC[avatarKey] ?? AVATAR_SRC.fox;

  return (
    <>
    <header
      style={{
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "stretch",
        background: "#f3f4f6",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      {/* ロゴ */}
      <Link
        href="/"
        style={{
          width: "10%",
          minWidth: 80,
          background: "#4f46e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        <span className="pixel-logo" style={{ fontSize: "clamp(10px, 1vw, 14px)", letterSpacing: 0, lineHeight: 1 }}>
          <span style={{ color: "white" }}>Mita</span>
          <span style={{ color: "#facc15" }}>=C</span>
        </span>
      </Link>

      {/* 中央: 警告バナー */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 16px" }}>
        {showEndOfWork ? (
          <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46", background: "#d1fae5", padding: "4px 12px", borderRadius: 99, display: "flex", alignItems: "center", gap: 6 }}>
            🏠 業務終了です。お疲れ様でした！
          </span>
        ) : hasEndReported ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fee2e2", padding: "4px 12px", borderRadius: 99 }}>
            <HiExclamation style={{ width: 14, height: 14, color: "#991b1b", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", whiteSpace: "nowrap" }}>退勤がまだ行われていません</span>
            <Link href="/">
              <button style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, padding: "2px 10px", cursor: "pointer" }}>
                退勤する
              </button>
            </Link>
          </div>
        ) : !hasStartReported ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef3c7", padding: "4px 12px", borderRadius: 99 }}>
            <HiExclamation style={{ width: 14, height: 14, color: "#92400e", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e", whiteSpace: "nowrap" }}>始業報告が未提出です</span>
            <Link href="/report/start">
              <button style={{ background: "#f59e0b", color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, padding: "2px 10px", cursor: "pointer" }}>
                始業報告する
              </button>
            </Link>
          </div>
        ) : !hasOvertimeReported ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ede9fe", padding: "4px 12px", borderRadius: 99 }}>
            <HiExclamation style={{ width: 14, height: 14, color: "#4c1d95", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4c1d95", whiteSpace: "nowrap" }}>残業報告が未提出です</span>
            <Link href="/report/overtime">
              <button style={{ background: "#4f46e5", color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, padding: "2px 10px", cursor: "pointer" }}>
                残業報告する
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffedd5", padding: "4px 12px", borderRadius: 99 }}>
            <HiExclamation style={{ width: 14, height: 14, color: "#9a3412", flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#9a3412", whiteSpace: "nowrap" }}>終業報告が未提出です</span>
            <Link href="/report/end">
              <button style={{ background: "#ea580c", color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, padding: "2px 10px", cursor: "pointer" }}>
                終業報告する
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* 右: アバター + ユーザー情報 */}
      <div
        style={{
          paddingRight: "clamp(8px, 1.5vw, 20px)",
          paddingLeft: "clamp(6px, 1vw, 12px)",
          display: "flex",
          alignItems: "center",
          gap: "clamp(4px, 0.7vw, 10px)",
          flexShrink: 0,
        }}
      >
        {/* アバター（コスチューム付き） */}
        <button
          onClick={() => setShowEditor(true)}
          style={{
            width: 40, height: 40, flexShrink: 0,
            borderRadius: "50%",
            border: "2px solid #c4b5fd",
            background: "#e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "visible",
            cursor: "pointer", padding: 0,
          }}
        >
          <AvatarWithCostume
            avatarSrc={avatarSrc}
            headCostume={headCostume}
            bodyCostume={bodyCostume}
            size={36}
            style={{ borderRadius: "50%" }}
          />
        </button>

        {/* 名前 */}
        <span style={{ fontSize: "clamp(11px, 1.1vw, 15px)", fontWeight: 800, color: "#1a1a2e", whiteSpace: "nowrap" }}>
          {currentUser.name}
        </span>

        {/* アカウントレベル＋XP */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontSize: "clamp(9px, 0.8vw, 10px)", color: "#9ca3af", fontWeight: 600, lineHeight: 1 }}>
            アカウント
          </span>
          <span style={{ fontSize: "clamp(10px, 0.9vw, 12px)", color: "#ea580c", fontWeight: 700, lineHeight: 1 }}>
            Lv.{currentUser.level}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: "clamp(40px, 4vw, 64px)", height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: "#ea580c", borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: "clamp(8px, 0.7vw, 9px)", color: "#9ca3af", whiteSpace: "nowrap" }}>
              {currentUser.xp}/{currentUser.xpToNext}
            </span>
          </div>
        </div>

        {/* 区切り */}
        <div style={{ width: 1, height: 28, background: "#e5e7eb", flexShrink: 0 }} />

        {/* シーズンパスレベル＋EXP */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontSize: "clamp(9px, 0.8vw, 10px)", color: "#9ca3af", fontWeight: 600, lineHeight: 1 }}>
            シーズン
          </span>
          <span style={{ fontSize: "clamp(10px, 0.9vw, 12px)", color: "#1e40af", fontWeight: 700, lineHeight: 1 }}>
            Lv.{passLevel}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: "clamp(40px, 4vw, 64px)", height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${passExpPct}%`, height: "100%", background: "#1e40af", borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: "clamp(8px, 0.7vw, 9px)", color: "#9ca3af", whiteSpace: "nowrap" }}>
              {passExp}/{passExpToNext}
            </span>
          </div>
        </div>

        {/* 区切り */}
        <div style={{ width: 1, height: 28, background: "#e5e7eb", flexShrink: 0 }} />

        {/* ログアウトボタン */}
        <button
          onClick={handleLogout}
          title="ログアウト"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            background: "none", border: "none", cursor: "pointer", padding: "2px 4px",
            color: "#4b5563", flexShrink: 0,
          }}
        >
          <HiLogout style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: 9, fontWeight: 600, whiteSpace: "nowrap" }}>ログアウト</span>
        </button>
      </div>
    </header>
    {showEditor && (
      <AvatarEditor
        initialAvatar={avatarKey}
        initialHeadCostume={headCostume}
        initialBodyCostume={bodyCostume}
        initialOmamori={omamori}
        onConfirm={(av, head, body, om) => { setAvatarKey(av); setHeadCostume(head); setBodyCostume(body); setOmamori(om); }}
        onClose={() => setShowEditor(false)}
      />
    )}
    </>
  );
}
