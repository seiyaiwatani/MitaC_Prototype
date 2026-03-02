"use client";

import Image from "next/image";
import { currentUser } from "@/lib/mock-data";

export default function AppHeader() {
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);

  const avatarSrc =
    currentUser.avatar === "cat"    ? "/avatars/avatar_cat.svg" :
    currentUser.avatar === "doragon"? "/avatars/avatar_doragon.svg" :
                                      "/avatars/avatar_fox.svg";

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
      <div
        style={{
          width: 130,
          background: "#4f46e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span className="pixel-logo" style={{ fontSize: 12, letterSpacing: 0, lineHeight: 1 }}>
          <span style={{ color: "white" }}>Mita</span>
          <span style={{ color: "#facc15" }}>=C</span>
        </span>
      </div>

      {/* 中央: 空きスペース（ナビゲーション等への拡張余地） */}
      <div style={{ flex: 1 }} />

      {/* 右: アバター + ユーザー情報（まとめて右寄せ） */}
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
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
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
