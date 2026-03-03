"use client";

import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@/lib/mock-data";
import { useAvatar } from "@/contexts/AvatarContext";

const AVATAR_SRC: Record<string, string> = {
  fox:     "/avatars/avatar_fox.svg",
  cat:     "/avatars/avatar_cat.svg",
  doragon: "/avatars/avatar_doragon.svg",
};

export default function AppHeader() {
  const { avatarKey } = useAvatar();
  const xpPct    = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
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
          width: 130,
          background: "#4f46e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        <span className="pixel-logo" style={{ fontSize: 12, letterSpacing: 0, lineHeight: 1 }}>
          <span style={{ color: "white" }}>Mita</span>
          <span style={{ color: "#facc15" }}>=C</span>
        </span>
      </Link>

      {/* 中央: 空きスペース */}
      <div style={{ flex: 1 }} />

      {/* 右: アバター + ユーザー情報 */}
      <div
        style={{
          paddingRight: 20,
          paddingLeft: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        {/* アバター */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #c4b5fd",
            background: "#e5e7eb",
            flexShrink: 0,
          }}
        >
          <Image
            src={avatarSrc}
            alt="アバター"
            width={36}
            height={36}
            style={{ objectFit: "cover", width: "100%", height: "100%", imageRendering: "pixelated" }}
          />
        </div>

        {/* 名前 */}
        <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", whiteSpace: "nowrap" }}>
          {currentUser.name}
        </span>

        {/* レベル＋XP */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
          <span style={{ fontSize: 12, color: "#4f46e5", fontWeight: 700, lineHeight: 1 }}>
            Lv.{currentUser.level}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div className="xp-bar" style={{ width: 80 }}>
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
            <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>
              {currentUser.xp}/{currentUser.xpToNext}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
