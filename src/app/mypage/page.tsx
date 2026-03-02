"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser, badges, missions } from "@/lib/mock-data";
import { HiArrowLeft, HiChevronRight, HiChevronUp, HiChevronDown } from "react-icons/hi";
import {
  SiNextdotjs, SiSass, SiPhp, SiWordpress, SiAmazonwebservices,
  SiTypescript, SiReact, SiDocker, SiPostgresql, SiGraphql, SiTerraform,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import type { IconType } from "react-icons";

const BADGE_ICON_MAP: Record<string, { Icon: IconType; color: string }> = {
  "Next":       { Icon: SiNextdotjs,          color: "#000000" },
  "SCSS":       { Icon: SiSass,               color: "#cc6699" },
  "Java":       { Icon: FaJava,               color: "#f89820" },
  "PHP":        { Icon: SiPhp,                color: "#8892be" },
  "WordPress":  { Icon: SiWordpress,          color: "#21759b" },
  "AWS":        { Icon: SiAmazonwebservices,  color: "#ff9900" },
  "TypeScript": { Icon: SiTypescript,         color: "#3178c6" },
  "React":      { Icon: SiReact,              color: "#61dafb" },
  "Docker":     { Icon: SiDocker,             color: "#2496ed" },
  "PostgreSQL": { Icon: SiPostgresql,         color: "#336791" },
  "GraphQL":    { Icon: SiGraphql,            color: "#e10098" },
  "Terraform":  { Icon: SiTerraform,          color: "#7b42bc" },
};

const COLS = 6;

export default function MyPage() {
  const [showAll, setShowAll] = useState(false);

  const acquiredCount = badges.filter((b) => b.acquired).length;
  const visibleBadges = showAll ? badges : badges.slice(0, COLS * 3);
  const missionDone   = missions.filter((m) => m.completed).length;

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>バッジ</span>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
          合計取得数: {acquiredCount}個
        </span>
      </div>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 10, gap: 10, overflowY: "auto" }}>

        {/* バッジグリッド */}
        <div className="card" style={{ padding: 12, flexShrink: 0 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 8,
          }}>
            {visibleBadges.map((b) => {
              const iconInfo = BADGE_ICON_MAP[b.name];
              return (
                <div
                  key={b.id}
                  title={`${b.name}: ${b.description}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 10,
                    border: `2px solid ${b.acquired ? "#10b981" : "#e5e7eb"}`,
                    background: b.acquired ? "#ecfdf5" : "#f9fafb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: b.acquired ? 1 : 0.4,
                  }}>
                    {iconInfo ? (
                      <iconInfo.Icon style={{
                        width: 28, height: 28,
                        color: b.acquired ? iconInfo.color : "#9ca3af",
                      }} />
                    ) : (
                      <span style={{ fontSize: 24 }}>{b.icon}</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, textAlign: "center",
                    color: b.acquired ? "#065f46" : "#9ca3af",
                  }}>
                    {b.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 展開ボタン */}
          {badges.length > COLS * 3 && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                onClick={() => setShowAll((v) => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 18, color: "#9ca3af", padding: "2px 12px",
                }}
              >
                {showAll ? <HiChevronUp style={{ width: 20, height: 20 }} /> : <HiChevronDown style={{ width: 20, height: 20 }} />}
              </button>
            </div>
          )}
        </div>

        {/* ミッション（リンクカード） */}
        <Link href="/mypage/missions" style={{ textDecoration: "none" }}>
          <div className="card" style={{
            padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, cursor: "pointer",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", marginBottom: 3 }}>ミッション</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>
                達成 {missionDone}/{missions.length} 件
              </div>
            </div>
            <HiChevronRight style={{ width: 20, height: 20, color: "#9ca3af" }} />
          </div>
        </Link>

        {/* XP・ステータス */}
        <div className="card" style={{ padding: 12, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#1a1a2e" }}>ステータス</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280", marginBottom: 4 }}>
                <span>Lv.{currentUser.level} → Lv.{currentUser.level + 1}</span>
                <span>{currentUser.xp} / {currentUser.xpToNext} XP</span>
              </div>
              <div className="xp-bar">
                <div
                  className="xp-bar-fill"
                  style={{ width: `${Math.round((currentUser.xp / currentUser.xpToNext) * 100)}%` }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#4f46e5" }}>{currentUser.level}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>レベル</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>{acquiredCount}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>バッジ</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b" }}>{currentUser.currency.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>コイン</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
