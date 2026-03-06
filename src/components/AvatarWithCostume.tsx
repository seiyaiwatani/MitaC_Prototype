"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

export type HeadCostume = "crown" | null;
export type BodyCostume = "medals" | "tie" | null;

interface CostumeStyle {
  top: string;
  left: string;
  width: string;
  transform: string;
}

const COSTUME_STYLES: Record<string, CostumeStyle> = {
  crown:  { top: "-8%",  left: "50%", width: "56%", transform: "translateX(-50%)" },
  medals: { top: "38%",  left: "50%", width: "52%", transform: "translateX(-50%)" },
  tie:    { top: "46%",  left: "50%", width: "42%", transform: "translateX(-50%)" },
};

/** コスチュームごとの効果 */
export const COSTUME_EFFECTS: Record<string, { label: string; color: string }> = {
  crown:  { label: "EXP +15%", color: "#4f46e5" },
  medals: { label: "EXP +10%", color: "#8b5cf6" },
  tie:    { label: "EXP +5%",  color: "#10b981" },
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const COSTUME_SRC: Record<string, string> = {
  crown:  `${BASE}/costumes/costume_crown.svg`,
  medals: `${BASE}/costumes/costume_medals.svg`,
  tie:    `${BASE}/costumes/costume_tie.svg`,
};

interface Props {
  avatarSrc: string;
  headCostume?: HeadCostume;
  bodyCostume?: BodyCostume;
  size?: number;
  animClass?: string;
  style?: CSSProperties;
  onAnimationEnd?: () => void;
}

export function AvatarWithCostume({
  avatarSrc,
  headCostume,
  bodyCostume,
  size = 80,
  animClass,
  style,
  onAnimationEnd,
}: Props) {
  return (
    <div
      className={animClass}
      style={{ width: size, height: size, position: "relative", flexShrink: 0, ...style }}
      onAnimationEnd={onAnimationEnd}
    >
      <Image
        src={avatarSrc}
        alt="アバター"
        width={size}
        height={size}
        style={{ imageRendering: "pixelated", objectFit: "contain", width: "100%", height: "100%" }}
      />
      {headCostume && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={COSTUME_SRC[headCostume]}
          alt={headCostume}
          style={{ position: "absolute", ...COSTUME_STYLES[headCostume], pointerEvents: "none" }}
        />
      )}
      {bodyCostume && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={COSTUME_SRC[bodyCostume]}
          alt={bodyCostume}
          style={{ position: "absolute", ...COSTUME_STYLES[bodyCostume], pointerEvents: "none" }}
        />
      )}
    </div>
  );
}
