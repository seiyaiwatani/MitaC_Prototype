import type { IconType } from "react-icons";
import {
  SiNextdotjs, SiSass, SiPhp, SiWordpress, SiAmazonwebservices,
  SiTypescript, SiReact, SiDocker, SiPostgresql, SiGraphql, SiTerraform,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";

export const BADGE_ICON_MAP: Record<string, { Icon: IconType; color: string }> = {
  "Next":       { Icon: SiNextdotjs,         color: "#000000" },
  "SCSS":       { Icon: SiSass,              color: "#cc6699" },
  "Java":       { Icon: FaJava,              color: "#f89820" },
  "PHP":        { Icon: SiPhp,               color: "#8892be" },
  "WordPress":  { Icon: SiWordpress,         color: "#21759b" },
  "AWS":        { Icon: SiAmazonwebservices, color: "#ff9900" },
  "TypeScript": { Icon: SiTypescript,        color: "#3178c6" },
  "React":      { Icon: SiReact,             color: "#61dafb" },
  "Docker":     { Icon: SiDocker,            color: "#2496ed" },
  "PostgreSQL": { Icon: SiPostgresql,        color: "#336791" },
  "GraphQL":    { Icon: SiGraphql,           color: "#e10098" },
  "Terraform":  { Icon: SiTerraform,         color: "#7b42bc" },
};

export const TIER_STYLE = {
  bronze: { bg: "#d4855e", border: "#b86b41", label: "ブロンズ", labelColor: "#7c3e1d" },
  silver: { bg: "#8eadc4", border: "#6a94b0", label: "シルバー", labelColor: "#374151" },
  gold:   { bg: "#f5c842", border: "#d4a200", label: "ゴールド", labelColor: "#78350f" },
} as const;

export const TIER_ORDER: Array<keyof typeof TIER_STYLE> = ["bronze", "silver", "gold"];
