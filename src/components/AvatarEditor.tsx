"use client";

import { AvatarWithCostume, HeadCostume, BodyCostume, COSTUME_SRC, COSTUME_EFFECTS } from "./AvatarWithCostume";

const AVATAR_OPTIONS: { key: string; label: string; src: string }[] = [
  { key: "fox",     label: "フォックス", src: "/avatars/avatar_fox.svg" },
  { key: "cat",     label: "キャット",   src: "/avatars/avatar_cat.svg" },
  { key: "doragon", label: "ドラゴン",   src: "/avatars/avatar_doragon.svg" },
];

const HEAD_OPTIONS: { key: HeadCostume; label: string; effect: string | null }[] = [
  { key: null,    label: "なし", effect: null },
  { key: "crown", label: "王冠", effect: COSTUME_EFFECTS.crown.label },
];

const BODY_OPTIONS: { key: BodyCostume; label: string; effect: string | null }[] = [
  { key: null,     label: "なし",    effect: null },
  { key: "medals", label: "メダル",  effect: COSTUME_EFFECTS.medals.label },
  { key: "tie",    label: "ネクタイ", effect: COSTUME_EFFECTS.tie.label },
];

interface Props {
  avatar: string;
  avatarSrc: string;
  headCostume: HeadCostume;
  bodyCostume: BodyCostume;
  onAvatarChange: (v: string) => void;
  onHeadChange: (v: HeadCostume) => void;
  onBodyChange: (v: BodyCostume) => void;
  onClose: () => void;
}

export function AvatarEditor({
  avatar,
  avatarSrc,
  headCostume,
  bodyCostume,
  onAvatarChange,
  onHeadChange,
  onBodyChange,
  onClose,
}: Props) {
  // 装備中の効果一覧
  const activeEffects = [
    headCostume ? { key: headCostume, ...COSTUME_EFFECTS[headCostume] } : null,
    bodyCostume ? { key: bodyCostume, ...COSTUME_EFFECTS[bodyCostume] } : null,
  ].filter(Boolean) as { key: string; label: string; color: string }[];

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 16, padding: "20px 24px",
          width: 320, maxWidth: "94vw",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>アバター・衣装</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* プレビュー */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          marginBottom: 10,
          background: "linear-gradient(135deg,#f0f4ff,#e0e7ff)", borderRadius: 12, padding: "20px 0 12px",
        }}>
          <AvatarWithCostume
            avatarSrc={avatarSrc}
            headCostume={headCostume}
            bodyCostume={bodyCostume}
            size={140}
          />
          {(headCostume || bodyCostume) && (
            <div style={{ marginTop: 8, fontSize: 10, color: "#4f46e5", fontWeight: 700 }}>
              ✨ 装備中
            </div>
          )}
        </div>

        {/* アクティブ効果 */}
        <div style={{
          display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap",
          minHeight: 24, marginBottom: 14,
        }}>
          {activeEffects.length === 0 ? (
            <span style={{ fontSize: 10, color: "#9ca3af" }}>効果なし</span>
          ) : (
            activeEffects.map((eff) => (
              <span key={eff.key} style={{
                fontSize: 10, fontWeight: 700,
                background: eff.color + "22", color: eff.color,
                borderRadius: 99, padding: "2px 10px",
                border: `1px solid ${eff.color}44`,
              }}>
                {eff.label}
              </span>
            ))
          )}
        </div>

        {/* アバター選択 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8, letterSpacing: "0.05em" }}>
            アバター
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {AVATAR_OPTIONS.map((opt) => {
              const selected = avatar === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => onAvatarChange(opt.key)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 12,
                    border: `2px solid ${selected ? "#4f46e5" : "#e5e7eb"}`,
                    background: selected ? "#eef2ff" : "#f9fafb",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", cursor: "pointer", gap: 4,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={opt.src} alt={opt.label} style={{ width: 44, height: 44, objectFit: "contain", imageRendering: "pixelated" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af" }}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 頭パーツ */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8, letterSpacing: "0.05em" }}>
            頭
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {HEAD_OPTIONS.map((opt) => {
              const selected = headCostume === opt.key;
              return (
                <button
                  key={String(opt.key)}
                  onClick={() => onHeadChange(opt.key)}
                  style={{
                    width: 64, height: 72, borderRadius: 12,
                    border: `2px solid ${selected ? "#4f46e5" : "#e5e7eb"}`,
                    background: selected ? "#eef2ff" : "#f9fafb",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", gap: 3, padding: 4,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {opt.key ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={COSTUME_SRC[opt.key]}
                      alt={opt.label}
                      style={{ width: 32, height: 32, objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: 22, color: "#d1d5db" }}>—</span>
                  )}
                  <span style={{ fontSize: 9, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af" }}>
                    {opt.label}
                  </span>
                  {opt.effect && (
                    <span style={{ fontSize: 8, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af", lineHeight: 1 }}>
                      {opt.effect}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 胴体パーツ */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8, letterSpacing: "0.05em" }}>
            胴体
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {BODY_OPTIONS.map((opt) => {
              const selected = bodyCostume === opt.key;
              return (
                <button
                  key={String(opt.key)}
                  onClick={() => onBodyChange(opt.key)}
                  style={{
                    width: 64, height: 72, borderRadius: 12,
                    border: `2px solid ${selected ? "#4f46e5" : "#e5e7eb"}`,
                    background: selected ? "#eef2ff" : "#f9fafb",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", gap: 3, padding: 4,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  {opt.key ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={COSTUME_SRC[opt.key]}
                      alt={opt.label}
                      style={{ width: 32, height: 32, objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: 22, color: "#d1d5db" }}>—</span>
                  )}
                  <span style={{ fontSize: 9, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af" }}>
                    {opt.label}
                  </span>
                  {opt.effect && (
                    <span style={{ fontSize: 8, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af", lineHeight: 1 }}>
                      {opt.effect}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 決定ボタン */}
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: 10, border: "none",
            background: "#4f46e5", color: "white",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          決定
        </button>
      </div>
    </div>
  );
}
