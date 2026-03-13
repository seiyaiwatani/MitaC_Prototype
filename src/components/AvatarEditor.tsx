"use client";

import { useState } from "react";
import { AvatarWithCostume, HeadCostume, BodyCostume, OmamorType, COSTUME_SRC, OMAMORI_EFFECTS } from "./AvatarWithCostume";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const AVATAR_OPTIONS: { key: string; label: string; src: string }[] = [
  { key: "fox",     label: "フォックス", src: `${BASE}/avatars/avatar_fox.svg` },
  { key: "cat",     label: "キャット",   src: `${BASE}/avatars/avatar_cat.svg` },
  { key: "doragon", label: "ドラゴン",   src: `${BASE}/avatars/avatar_doragon.svg` },
];

const HEAD_OPTIONS: { key: HeadCostume; label: string }[] = [
  { key: null,    label: "なし" },
  { key: "crown", label: "王冠" },
];

const BODY_OPTIONS: { key: BodyCostume; label: string }[] = [
  { key: null,     label: "なし" },
  { key: "medals", label: "メダル" },
  { key: "tie",    label: "ネクタイ" },
];

const OMAMORI_OPTIONS: { key: OmamorType; label: string }[] = [
  { key: null,             label: "なし" },
  { key: "omamori_lucky",  label: OMAMORI_EFFECTS.omamori_lucky.name },
  { key: "omamori_study",  label: OMAMORI_EFFECTS.omamori_study.name },
];

interface Props {
  initialAvatar: string;
  initialHeadCostume: HeadCostume;
  initialBodyCostume: BodyCostume;
  initialOmamori: OmamorType;
  onConfirm: (avatar: string, head: HeadCostume, body: BodyCostume, omamori: OmamorType) => void;
  onClose: () => void;
}

export function AvatarEditor({
  initialAvatar,
  initialHeadCostume,
  initialBodyCostume,
  initialOmamori,
  onConfirm,
  onClose,
}: Props) {
  const [draftAvatar, setDraftAvatar]   = useState(initialAvatar);
  const [draftHead, setDraftHead]       = useState<HeadCostume>(initialHeadCostume);
  const [draftBody, setDraftBody]       = useState<BodyCostume>(initialBodyCostume);
  const [draftOmamori, setDraftOmamori] = useState<OmamorType>(initialOmamori);

  const draftAvatarSrc = AVATAR_OPTIONS.find((o) => o.key === draftAvatar)?.src
    ?? AVATAR_OPTIONS[0].src;

  const activeEffects = draftOmamori
    ? [{ key: draftOmamori, ...OMAMORI_EFFECTS[draftOmamori] }]
    : [];

  const handleConfirm = () => {
    onConfirm(draftAvatar, draftHead, draftBody, draftOmamori);
    onClose();
  };

  /* 共通の選択ボタンスタイル生成 */
  const itemBtn = (selected: boolean, color?: string) => ({
    width: 68, height: 68, borderRadius: 12,
    border: `2px solid ${selected ? (color ?? "#4f46e5") : "#e5e7eb"}`,
    background: selected ? (color ? color + "18" : "#eef2ff") : "#f9fafb",
    display: "flex" as const, flexDirection: "column" as const,
    alignItems: "center" as const, justifyContent: "center" as const,
    cursor: "pointer" as const, gap: 3, padding: 4,
    transition: "border-color 0.15s, background 0.15s",
  });

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
          background: "white", borderRadius: 16, padding: "24px 30px",
          width: 780, maxWidth: "94vw",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
          maxHeight: "90vh", overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e" }}>アバター・衣装</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* 2カラム: 左プレビュー / 右アイテム選択 */}
        <div style={{ display: "flex", gap: 28 }}>
          {/* ===== 左: プレビュー ===== */}
          <div style={{ flex: "0 0 280px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              background: "linear-gradient(135deg,#f0f4ff,#e0e7ff)", borderRadius: 14, padding: "28px 0 20px",
              flex: 1, minHeight: 260,
            }}>
              <AvatarWithCostume
                avatarSrc={draftAvatarSrc}
                headCostume={draftHead}
                bodyCostume={draftBody}
                size={200}
              />
              {(draftHead || draftBody) && (
                <div style={{ marginTop: 8, fontSize: 14, color: "#4f46e5", fontWeight: 700 }}>
                  ✨ 装備中
                </div>
              )}
            </div>

            {/* アクティブ効果 */}
            <div style={{
              display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap",
              minHeight: 24,
            }}>
              {activeEffects.length === 0 ? (
                <span style={{ fontSize: 14, color: "#9ca3af" }}>効果なし</span>
              ) : (
                activeEffects.map((eff) => (
                  <span key={eff.key} style={{
                    fontSize: 14, fontWeight: 700,
                    background: eff.color + "22", color: eff.color,
                    borderRadius: 99, padding: "2px 10px",
                    border: `1px solid ${eff.color}44`,
                  }}>
                    {eff.emoji} {eff.label}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* ===== 右: アイテム選択 ===== */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {/* アバター選択 */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>
                アバター
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {AVATAR_OPTIONS.map((opt) => {
                  const selected = draftAvatar === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setDraftAvatar(opt.key)}
                      style={{
                        ...itemBtn(selected),
                        width: "auto", flex: 1,
                        height: 72,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opt.src} alt={opt.label} style={{ width: 38, height: 38, objectFit: "contain", imageRendering: "pixelated" }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 頭パーツ */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>
                頭
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {HEAD_OPTIONS.map((opt) => {
                  const selected = draftHead === opt.key;
                  return (
                    <button
                      key={String(opt.key)}
                      onClick={() => setDraftHead(opt.key)}
                      style={itemBtn(selected)}
                    >
                      {opt.key ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={COSTUME_SRC[opt.key]}
                          alt={opt.label}
                          style={{ width: 28, height: 28, objectFit: "contain" }}
                        />
                      ) : (
                        <span style={{ fontSize: 20, color: "#d1d5db" }}>—</span>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 胴体パーツ */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>
                胴体
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {BODY_OPTIONS.map((opt) => {
                  const selected = draftBody === opt.key;
                  return (
                    <button
                      key={String(opt.key)}
                      onClick={() => setDraftBody(opt.key)}
                      style={itemBtn(selected)}
                    >
                      {opt.key ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={COSTUME_SRC[opt.key]}
                          alt={opt.label}
                          style={{ width: 28, height: 28, objectFit: "contain" }}
                        />
                      ) : (
                        <span style={{ fontSize: 20, color: "#d1d5db" }}>—</span>
                      )}
                      <span style={{ fontSize: 14, fontWeight: 700, color: selected ? "#4f46e5" : "#9ca3af" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* おまもり */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6, letterSpacing: "0.05em" }}>
                おまもり
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {OMAMORI_OPTIONS.map((opt) => {
                  const selected = draftOmamori === opt.key;
                  const eff = opt.key ? OMAMORI_EFFECTS[opt.key] : null;
                  return (
                    <button
                      key={String(opt.key)}
                      onClick={() => setDraftOmamori(opt.key)}
                      style={{
                        ...itemBtn(selected, eff?.color),
                        width: "auto", flex: 1, height: 78,
                      }}
                    >
                      <span style={{ fontSize: eff ? 22 : 20, color: eff ? undefined : "#d1d5db" }}>
                        {eff ? eff.emoji : "—"}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: selected ? (eff?.color ?? "#4f46e5") : "#9ca3af", lineHeight: 1.2, textAlign: "center" }}>
                        {opt.label}
                      </span>
                      {eff && (
                        <span style={{ fontSize: 14, fontWeight: 700, color: eff.color, lineHeight: 1 }}>
                          {eff.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 決定ボタン */}
            <button
              onClick={handleConfirm}
              style={{
                width: "100%", padding: "10px 0",
                borderRadius: 10, border: "none",
                background: "#4f46e5", color: "white",
                fontWeight: 700, fontSize: 14, cursor: "pointer",
                letterSpacing: "0.05em", marginTop: 4,
              }}
            >
              決定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
