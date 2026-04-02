"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { badges } from "@/lib/mock-data";
import { BADGE_ICON_MAP, TIER_STYLE, TIER_ORDER } from "@/lib/badge-config";
import type { Badge, BadgeTier } from "@/types";
import { HiSearch, HiSortAscending } from "react-icons/hi";

type SortMode = "standard" | "rank" | "acquired";

const TIER_RANK: Record<BadgeTier, number> = { gold: 0, silver: 1, bronze: 2 };

// ── 他ユーザーモックデータ ──
type OtherUser = {
  id: string;
  name: string;
  headerGradient: string;
  badges: Array<{ name: string; tier: BadgeTier }>;
};

const HEADER_BG = "#007aff";

type AvatarKey = "cat" | "fox" | "doragon";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const AVATAR_SRC: Record<AvatarKey, string> = {
  cat: `${BASE}/avatars/avatar_cat.svg`,
  fox: `${BASE}/avatars/avatar_fox.svg`,
  doragon: `${BASE}/avatars/avatar_doragon.svg`,
};

type OtherUserWithAvatar = OtherUser & { avatar: AvatarKey };

const OTHER_USERS: OtherUserWithAvatar[] = [
  {
    id: "u1",
    name: "田中 一郎",
    avatar: "cat",
    headerGradient: HEADER_BG,
    badges: [
      { name: "React", tier: "gold" },
      { name: "TypeScript", tier: "silver" },
    ],
  },
  {
    id: "u2",
    name: "佐藤 花子",
    avatar: "fox",
    headerGradient: HEADER_BG,
    badges: [
      { name: "Next", tier: "silver" },
      { name: "Java", tier: "bronze" },
    ],
  },
  {
    id: "u3",
    name: "山田 太郎",
    avatar: "doragon",
    headerGradient: HEADER_BG,
    badges: [
      { name: "React", tier: "silver" },
      { name: "PHP", tier: "bronze" },
    ],
  },
  {
    id: "u4",
    name: "鈴木 次郎",
    avatar: "cat",
    headerGradient: HEADER_BG,
    badges: [
      { name: "Next", tier: "gold" },
      { name: "React", tier: "gold" },
    ],
  },
  {
    id: "u5",
    name: "伊藤 美咲",
    avatar: "fox",
    headerGradient: HEADER_BG,
    badges: [
      { name: "AWS", tier: "bronze" },
      { name: "Docker", tier: "bronze" },
    ],
  },
  {
    id: "u6",
    name: "高橋 健",
    avatar: "doragon",
    headerGradient: HEADER_BG,
    badges: [
      { name: "AWS", tier: "gold" },
      { name: "Terraform", tier: "silver" },
    ],
  },
  {
    id: "u7",
    name: "中村 さくら",
    avatar: "cat",
    headerGradient: HEADER_BG,
    badges: [
      { name: "React", tier: "gold" },
      { name: "Next", tier: "gold" },
      { name: "TypeScript", tier: "silver" },
      { name: "AWS", tier: "silver" },
      { name: "Docker", tier: "bronze" },
      { name: "PostgreSQL", tier: "bronze" },
    ],
  },
];

const bronzeCount = badges.filter((b) => b.tier === "bronze").length;
const silverCount = badges.filter((b) => b.tier === "silver").length;
const goldCount = badges.filter((b) => b.tier === "gold").length;


function BadgeDetailPanel({
  badge,
  viewTier,
  onSelectTier,
}: {
  badge: Badge;
  viewTier: BadgeTier | null;
  onSelectTier: (tier: BadgeTier) => void;
}) {
  const iconInfo = BADGE_ICON_MAP[badge.name];

  // 表示するティア: viewTier指定があればそれ、なければ現在の最高ティア
  const displayTier = viewTier ?? badge.tier ?? null;
  const displayTierStyle = displayTier ? TIER_STYLE[displayTier] : null;

  const currentTierIndex = badge.tier ? TIER_ORDER.indexOf(badge.tier) : -1;
  const displayTierIndex = displayTier ? TIER_ORDER.indexOf(displayTier) : -1;

  const isAcquiredTier =
    displayTierIndex >= 0 && displayTierIndex <= currentTierIndex;
  const isMaxTier = badge.tier === "gold" && displayTier === "gold";
  const isNextTier = displayTierIndex === currentTierIndex + 1;

  // 進捗バー
  const hasProgress =
    isNextTier &&
    badge.nextTierProgress !== undefined &&
    badge.nextTierGoal !== undefined &&
    badge.nextTierGoal > 0;
  const pct = hasProgress
    ? Math.min(
        Math.round((badge.nextTierProgress! / badge.nextTierGoal!) * 100),
        100,
      )
    : 0;
  const goldExp = isMaxTier && badge.exp !== undefined ? badge.exp : 0;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", background: "white" }}
    >
      {/* バッジ名 */}
      <div style={{ padding: "16px 16px 0", textAlign: "center", fontWeight: 800, fontSize: 18, color: "#1a1a2e", flexShrink: 0 }}>
        {badge.name}
      </div>
      {/* ティア選択行 */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 20, padding: "14px 16px 16px", flexShrink: 0 }}>
        {TIER_ORDER.map((tier) => {
          const tierIdx = TIER_ORDER.indexOf(tier);
          const isAcq = badge.acquired && tierIdx <= currentTierIndex;
          const isDisp = tier === displayTier;
          const ts = TIER_STYLE[tier];
          const size = isDisp ? 80 : isAcq ? 60 : 44;
          return (
            <div
              key={tier}
              onClick={() => onSelectTier(tier)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
            >
              <div style={{
                width: size, height: size, borderRadius: "50%",
                background: isAcq ? ts.bg : "#d1d5db",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: isAcq ? 1 : 0.35,
                outline: isDisp ? `3px solid ${ts.border}` : "none",
                outlineOffset: 3,
                transition: "all 0.2s",
                flexShrink: 0,
              }}>
                {iconInfo ? (
                  <iconInfo.Icon style={{ width: size * 0.5, height: size * 0.5, color: isAcq ? "white" : "#9ca3af" }} />
                ) : (
                  <span style={{ fontSize: size * 0.42 }}>{badge.icon}</span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: isAcq ? ts.labelColor : "#9ca3af" }}>{ts.label}</span>
              {isAcq && <span style={{ fontSize: 9, color: "#10b981", fontWeight: 700 }}>取得済</span>}
            </div>
          );
        })}
      </div>

      {/* 取得日 */}
      {isAcquiredTier && (() => {
        const historyEntry = badge.tierHistory?.find((h) => h.tier === displayTier);
        if (!historyEntry) return null;
        return (
          <div style={{ padding: "0 24px 14px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 4, letterSpacing: "0.05em" }}>取得日</div>
            <div style={{ fontSize: 14, color: "#374151", background: "#f9fafb", borderRadius: 6, padding: "6px 10px" }}>
              {historyEntry.date.replace(/-/g, "/")}
            </div>
          </div>
        );
      })()}

      {/* 進捗バー */}
      <div style={{ padding: "0 24px 20px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
              letterSpacing: "0.05em",
            }}
          >
            {isMaxTier ? "EXP蓄積" : "進捗"}
          </span>
          <span style={{ fontSize: 14, color: "#6b7280" }}>
            {isMaxTier
              ? `累計 ${goldExp.toLocaleString()} EXP`
              : hasProgress
                ? `${badge.nextTierProgress} / ${badge.nextTierGoal}`
                : isAcquiredTier
                  ? "取得済み"
                  : `0 / ${badge.nextTierGoal ?? "—"}`}
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "#e5e7eb",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: isMaxTier
                ? "100%"
                : isAcquiredTier && !hasProgress
                  ? "100%"
                  : `${pct}%`,
              height: "100%",
              borderRadius: 3,
              background:
                isAcquiredTier && displayTierStyle
                  ? displayTierStyle.bg
                  : "#007aff",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* 取得履歴 */}
      {badge.tierHistory && badge.tierHistory.length > 0 && (
        <>
          <div style={{ borderTop: "1px solid #e5e7eb", flexShrink: 0 }} />
          <div>
            {[...badge.tierHistory].reverse().map((h, i) => {
              const ts = TIER_STYLE[h.tier];
              const bgColor = h.tier === "bronze" ? "#fdf6f3" : h.tier === "silver" ? "#f3f4f6" : "#fffbeb";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", borderBottom: "1px solid #f3f4f6", background: bgColor }}>
                  <span style={{ fontSize: 14, color: "#9ca3af", flexShrink: 0, minWidth: 84 }}>{h.date.replace(/-/g, "/")}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: ts.labelColor }}>{ts.label}バッジ取得</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function MyPage() {
  const [selectedBadge, setSelectedBadge] = useState<Badge>(badges[0]);
  const [selectedTier, setSelectedTier] = useState<BadgeTier | null>(null);
  const [badgeFilter, setBadgeFilter] = useState<string | null>(null);
  const [userNameSearch, setUserNameSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("standard");
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailUser, setDetailUser] = useState<OtherUserWithAvatar | null>(
    null,
  );
  const [modalBadge, setModalBadge] = useState<{
    name: string;
    tier: BadgeTier;
  } | null>(null);

  const sortedBadges = useMemo(() => {
    if (sortMode === "rank") {
      // 取得済み（ゴールド→シルバー→ブロンズ）→ 未取得
      return [...badges].sort((a, b) => {
        const ra = a.acquired && a.tier ? TIER_RANK[a.tier] : 99;
        const rb = b.acquired && b.tier ? TIER_RANK[b.tier] : 99;
        return ra - rb;
      });
    }
    if (sortMode === "acquired") {
      return [...badges].sort(
        (a, b) => Number(!a.acquired) - Number(!b.acquired),
      );
    }
    return badges;
  }, [sortMode]);

  const selectBadge = (b: Badge) => {
    setSelectedBadge(b);
    setSelectedTier(null);
    setBadgeFilter(b.name);
  };

  const filteredForSearch = badges.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
          バッジ一覧
        </span>
      </div>

      {/* 検索モーダル */}
      {showSearch && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 400,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 60,
          }}
          onClick={() => setShowSearch(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 14,
              width: 320,
              maxWidth: "92vw",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 検索入力 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <HiSearch
                style={{
                  width: 16,
                  height: 16,
                  color: "#9ca3af",
                  flexShrink: 0,
                }}
              />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="バッジ名を検索..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  color: "#1a1a2e",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {/* 結果リスト */}
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              {filteredForSearch.length === 0 ? (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: 14,
                  }}
                >
                  見つかりませんでした
                </div>
              ) : (
                filteredForSearch.map((b) => {
                  const iconInfo = BADGE_ICON_MAP[b.name];
                  const ts = b.tier ? TIER_STYLE[b.tier] : null;
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        selectBadge(b);
                        setShowSearch(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f9fafb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: ts ? ts.bg : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: b.acquired ? 1 : 0.4,
                        }}
                      >
                        {iconInfo ? (
                          <iconInfo.Icon
                            style={{
                              width: 18,
                              height: 18,
                              color: b.acquired ? "white" : "#9ca3af",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 16 }}>{b.icon}</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 14,
                            color: "#1a1a2e",
                          }}
                        >
                          {b.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: ts ? ts.labelColor : "#9ca3af",
                          }}
                        >
                          {ts ? `${ts.label}取得済み` : "未取得"}
                        </div>
                      </div>
                      <HiSortAscending
                        style={{ width: 14, height: 14, color: "#d1d5db" }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* コンテンツ全体ラッパー（左右20pxパディング・縦全体） */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px",
          overflow: "hidden",
          gap: 16,
        }}
      >
        {/* 2カラムボディ */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.5fr)",
            gap: 16,
          }}
        >
          {/* ===== 左: バッジグリッド ===== */}
          <div
            style={{
              overflowY: "auto",
              padding: "10px 12px",
              background: "white",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              overflow: "clip",
            }}
          >
            <div style={{ overflowY: "auto", height: "100%" }}>
              {/* ティア集計 + ソート・検索 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingBottom: 8,
                }}
              >
                {/* ソート */}
                <div
                  style={{
                    display: "flex",
                    background: "#f3f4f6",
                    borderRadius: 7,
                    padding: 2,
                    flexShrink: 0,
                  }}
                >
                  {(["standard", "rank", "acquired"] as SortMode[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        onClick={() => setSortMode(mode)}
                        style={{
                          padding: "2px 7px",
                          borderRadius: 5,
                          border: "none",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            sortMode === mode ? "white" : "transparent",
                          color: sortMode === mode ? "#1a1a2e" : "#9ca3af",
                          boxShadow:
                            sortMode === mode
                              ? "0 1px 3px rgba(0,0,0,0.1)"
                              : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {mode === "standard"
                          ? "標準"
                          : mode === "rank"
                            ? "ランク"
                            : "取得済み"}
                      </button>
                    ),
                  )}
                </div>
                {/* 検索ボタン */}
                <button
                  onClick={() => {
                    setShowSearch(true);
                    setSearchQuery("");
                  }}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HiSearch
                    style={{ width: 13, height: 13, color: "#6b7280" }}
                  />
                </button>
                {/* ティア集計（右寄せ） */}
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  {(
                    [
                      {
                        tier: "bronze",
                        count: bronzeCount,
                        bg: "#d4855e",
                        label: "ブロンズ",
                      },
                      {
                        tier: "silver",
                        count: silverCount,
                        bg: "#8eadc4",
                        label: "シルバー",
                      },
                      {
                        tier: "gold",
                        count: goldCount,
                        bg: "#f5c842",
                        label: "ゴールド",
                      },
                    ] as const
                  ).map(({ tier, count, bg, label }) => (
                    <span
                      key={tier}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 11,
                        color: "#6b7280",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: bg,
                          display: "inline-block",
                        }}
                      />
                      {label} {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* 区切り */}
              <div
                style={{ borderTop: "1px solid #e5e7eb", marginBottom: 10 }}
              />

              {/* バッジグリッド（最高ティアのみ表示） */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {sortedBadges.map((b) => {
                  const iconInfo = BADGE_ICON_MAP[b.name];
                  const ts = b.tier ? TIER_STYLE[b.tier] : null;
                  const isSelected = badgeFilter === b.name;
                  return (
                    <div
                      key={b.id}
                      onClick={() => selectBadge(b)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        padding: "8px 4px",
                        borderRadius: 10,
                        cursor: "pointer",
                        background: isSelected ? "rgba(0,122,255,0.06)" : "transparent",
                        border: `2px solid ${isSelected ? "#007aff" : "transparent"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: ts ? ts.bg : "#e5e7eb",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: b.acquired ? 1 : 0.3,
                        flexShrink: 0,
                      }}>
                        {iconInfo ? (
                          <iconInfo.Icon style={{ width: 22, height: 22, color: b.acquired ? "white" : "#9ca3af" }} />
                        ) : (
                          <span style={{ fontSize: 18 }}>{b.icon}</span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textAlign: "center", lineHeight: 1.2 }}>{b.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ===== 右: バッジ詳細パネル ===== */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              background: "white",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRadius: 12,
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
              <BadgeDetailPanel
                badge={selectedBadge}
                viewTier={selectedTier}
                onSelectTier={(tier) => setSelectedTier(tier)}
              />
            </div>
          </div>
        </div>

        {/* ===== 他のユーザーのバッジ取得状況 ===== */}
        {(() => {
          const displayUsers = OTHER_USERS
            .filter((u) => !badgeFilter || u.badges.some((b) => b.name === badgeFilter))
            .filter((u) => !userNameSearch || u.name.includes(userNameSearch));
          return (
            <div style={{ flexShrink: 0, border: "1px solid #e5e7eb", background: "#fafafa", borderRadius: 12, overflow: "clip" }}>
              <div style={{ padding: "6px 20px 4px", display: "flex", alignItems: "center", gap: 8 }}>
                {badgeFilter ? (
                  <>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                      {badgeFilter} を持つユーザー
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "#e0e7ff", color: "#3730a3", borderRadius: 99, padding: "1px 7px" }}>
                      {displayUsers.length}人
                    </span>
                    <button
                      onClick={() => setBadgeFilter(null)}
                      style={{ marginLeft: 4, fontSize: 11, color: "#dc2626", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 99, padding: "2px 10px", cursor: "pointer", fontWeight: 700 }}
                    >
                      ✕ 選択解除
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                    他のユーザーのバッジ取得状況
                  </span>
                )}
                <input
                  type="text"
                  placeholder="名前で検索..."
                  value={userNameSearch}
                  onChange={(e) => setUserNameSearch(e.target.value)}
                  style={{ marginLeft: "auto", fontSize: 11, padding: "3px 10px", borderRadius: 99, border: "1px solid #9ca3af", outline: "none", width: 140 }}
                />
              </div>
              <div style={{ overflowX: "auto", padding: "0 10px 8px", scrollbarWidth: "thin", minHeight: 160 }}>
                {badgeFilter && displayUsers.length === 0 ? (
                  <div style={{ padding: "12px 10px", fontSize: 13, color: "#9ca3af" }}>
                    このバッジを持つユーザーはいません
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10, width: "max-content" }}>
                    {displayUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    flexShrink: 0,
                    width: 190,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* カードヘッダー（グラデーション） */}
                  <div
                    style={{
                      background: user.headerGradient,
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <img
                      src={AVATAR_SRC[user.avatar]}
                      alt={user.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.25)",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{ fontWeight: 800, fontSize: 12, color: "white" }}
                    >
                      {user.name}
                    </div>
                  </div>

                  {/* カードボディ */}
                  <div
                    style={{
                      padding: "8px 10px 10px",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {/* 扱える技術（バッジ・4件まで表示） */}
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#6b7280",
                      }}
                    >
                      扱える技術
                    </div>
                    <div style={{ display: "flex", flexWrap: "nowrap", gap: 6, overflow: "hidden" }}>
                      {user.badges.slice(0, 4).map((ub, i) => {
                        const ts = TIER_STYLE[ub.tier];
                        const iconInfo = BADGE_ICON_MAP[ub.name];
                        return (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: "50%",
                              background: ts.bg,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>
                              {iconInfo
                                ? <iconInfo.Icon style={{ width: 16, height: 16, color: "white" }} />
                                : <span style={{ fontSize: 14 }}>🏅</span>
                              }
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#374151", textAlign: "center", lineHeight: 1.2 }}>
                              {ub.name}
                            </span>
                          </div>
                        );
                      })}
                      {user.badges.length > 4 && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#9ca3af",
                            alignSelf: "center",
                          }}
                        >
                          ...+{user.badges.length - 4}
                        </span>
                      )}
                    </div>

                    {/* ボタン */}
                    <div style={{ marginTop: "auto", paddingTop: 4 }}>
                      <button
                        onClick={() => setDetailUser(user)}
                        style={{
                          width: "100%",
                          padding: "5px 0",
                          borderRadius: 6,
                          border: "1px solid #007aff",
                          background: "white",
                          color: "#007aff",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        バッジ詳細
                      </button>
                    </div>
                  </div>
                </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
      {/* end コンテンツ全体ラッパー */}

      {/* ===== バッジ詳細モーダル ===== */}
      {detailUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            setDetailUser(null);
            setModalBadge(null);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              width: 520,
              maxWidth: "94vw",
              boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div
              style={{
                background: "#007aff",
                padding: "14px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {modalBadge && (
                  <button
                    onClick={() => setModalBadge(null)}
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      border: "none",
                      cursor: "pointer",
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      borderRadius: 6,
                      padding: "3px 10px",
                      lineHeight: 1.5,
                    }}
                  >
                    ← 戻る
                  </button>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {!modalBadge && (
                    <img
                      src={AVATAR_SRC[detailUser.avatar]}
                      alt={detailUser.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.25)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{ fontSize: 16, fontWeight: 800, color: "white" }}
                    >
                      {detailUser.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.8)",
                        marginTop: 2,
                      }}
                    >
                      {modalBadge
                        ? `${modalBadge.name} の取得条件`
                        : "バッジ一覧"}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailUser(null);
                  setModalBadge(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 20,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

          {/* コンテンツ */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {!modalBadge ? (
              /* バッジ一覧 */
              <div
                style={{
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {detailUser.badges.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: 14,
                      padding: 24,
                    }}
                  >
                    バッジなし
                  </div>
                ) : (
                  detailUser.badges.map((ub, i) => {
                    const ts = TIER_STYLE[ub.tier];
                    const iconInfo = BADGE_ICON_MAP[ub.name];
                    return (
                      <div
                        key={i}
                        onClick={() => setModalBadge(ub)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: ts.bg + "18",
                          border: `1px solid ${ts.bg}44`,
                          cursor: "pointer",
                        }}
                      >
                        {iconInfo && (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: ts.bg + "22",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <iconInfo.Icon
                              style={{ width: 24, height: 24, color: ts.bg }}
                            />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#1a1a2e",
                            }}
                          >
                            {ub.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: ts.labelColor,
                              marginTop: 2,
                            }}
                          >
                            {ts.label}
                          </div>
                        </div>
                        <span style={{ fontSize: 18, color: "#9ca3af" }}>
                          ›
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              (() => {
                /* バッジ取得条件ビュー */
                const masterBadge = badges.find(
                  (b) => b.name === modalBadge.name,
                );
                const ts = TIER_STYLE[modalBadge.tier];
                const iconInfo = BADGE_ICON_MAP[modalBadge.name];
                return (
                  <div
                    style={{
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {/* バッジ概要 */}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      {iconInfo && (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 14,
                            background: ts.bg + "22",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <iconInfo.Icon
                            style={{ width: 32, height: 32, color: ts.bg }}
                          />
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#1a1a2e",
                          }}
                        >
                          {modalBadge.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            marginTop: 2,
                          }}
                        >
                          {masterBadge?.description ?? ""}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: ts.labelColor,
                            marginTop: 4,
                          }}
                        >
                          {ts.label}バッジ取得済み
                        </div>
                      </div>
                    </div>

                    {/* 各ティアの取得条件 */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "#6b7280",
                        }}
                      >
                        取得条件
                      </div>
                      {(["bronze", "silver", "gold"] as BadgeTier[]).map(
                        (tier) => {
                          const tts = TIER_STYLE[tier];
                          const cond = masterBadge?.tierConditions?.[tier];
                          const tierRankMap: Record<BadgeTier, number> = {
                            bronze: 0,
                            silver: 1,
                            gold: 2,
                          };
                          const isAcquired =
                            tierRankMap[modalBadge.tier] >= tierRankMap[tier];
                          return (
                            <div
                              key={tier}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                padding: "12px 14px",
                                borderRadius: 10,
                                background: isAcquired
                                  ? tts.bg + "15"
                                  : "#f9fafb",
                                border: `1px solid ${isAcquired ? tts.bg + "55" : "#e5e7eb"}`,
                              }}
                            >
                              <div
                                style={{
                                  minWidth: 48,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: isAcquired
                                    ? tts.labelColor
                                    : "#9ca3af",
                                  paddingTop: 1,
                                }}
                              >
                                {tts.label}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  fontSize: 14,
                                  color: isAcquired ? "#1a1a2e" : "#6b7280",
                                }}
                              >
                                {cond ?? "条件情報なし"}
                              </div>
                              {isAcquired && (
                                <span style={{ fontSize: 14, color: tts.bg }}>
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
