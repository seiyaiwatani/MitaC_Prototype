"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser } from "@/lib/mock-data";
import { useAvatar } from "@/contexts/AvatarContext";
import { useSeasonPass } from "@/contexts/SeasonPassContext";
import { AvatarWithCostume } from "@/components/AvatarWithCostume";
import { AvatarEditor } from "@/components/AvatarEditor";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const AVATAR_SRC: Record<string, string> = {
  fox:     `${BASE}/avatars/avatar_fox.svg`,
  cat:     `${BASE}/avatars/avatar_cat.svg`,
  doragon: `${BASE}/avatars/avatar_doragon.svg`,
};

export default function AppHeader() {
  const { avatarKey, setAvatarKey, headCostume, setHeadCostume, bodyCostume, setBodyCostume, omamori, setOmamori } = useAvatar();
  const { passLevel, passExp, passExpToNext } = useSeasonPass();
  const [editorOpen, setEditorOpen] = useState(false);
  const xpPct     = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const passExpPct = Math.round((passExp / passExpToNext) * 100);
  const avatarSrc = AVATAR_SRC[avatarKey] ?? AVATAR_SRC.fox;

  return (
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

      {/* 中央: ナビ */}
      <nav style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5vw", overflow: "hidden", padding: "0 1vw" }}>
        {[
          { href: "/mypage/rewards", label: "報酬交換" },
          { href: "/admin",          label: "プロジェクト" },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{
            padding: "5px clamp(8px, 1.2vw, 18px)", borderRadius: 99, textDecoration: "none",
            fontSize: "clamp(11px, 1vw, 13px)", color: "#374151", fontWeight: 700,
            background: "white", border: "1px solid #e5e7eb", whiteSpace: "nowrap",
          }}>
            {item.label}
          </Link>
        ))}
        <button
          onClick={() => setEditorOpen(true)}
          style={{
            padding: "5px clamp(8px, 1vw, 12px)", borderRadius: 99,
            fontSize: "clamp(11px, 1vw, 13px)", color: "#374151", fontWeight: 700,
            background: "white", border: "1px solid #e5e7eb",
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          アバター編集
        </button>
      </nav>

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
        <div style={{
          width: 40, height: 40, flexShrink: 0,
          borderRadius: "50%",
          border: "2px solid #c4b5fd",
          background: "#e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "visible",
        }}>
          <AvatarWithCostume
            avatarSrc={avatarSrc}
            headCostume={headCostume}
            bodyCostume={bodyCostume}
            size={36}
            style={{ borderRadius: "50%" }}
          />
        </div>

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
      </div>

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
    </header>
  );
}
