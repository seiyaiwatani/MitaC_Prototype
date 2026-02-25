"use client";

import { currentUser } from "@/lib/mock-data";
import styles from "./index.module.scss";

interface PageHeaderProps {
  background?: string;
  avatarIcon?: string;
  role?: string;
  xpBadge?: string;
}

export default function PageHeader({
  background = "linear-gradient(90deg,#1e1b4b,#312e81)",
  avatarIcon = "⚔️",
  role,
  xpBadge,
}: PageHeaderProps) {
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);

  return (
    <header className={styles.page_header} style={{ background }}>
      <span className={styles.page_header_logo}>Mita=C</span>
      <div className={styles.page_header_xp_section}>
        <div className={styles.page_header_xp_labels}>
          <span>XP</span>
          <span>{currentUser.xp}/{currentUser.xpToNext}</span>
        </div>
        <div className={styles.page_header_xp_track}>
          <div className={styles.page_header_xp_fill} style={{ width: `${xpPct}%` }} />
        </div>
      </div>
      <div className={styles.page_header_avatar_section}>
        <span className={styles.page_header_avatar_hint}>アバター→</span>
        <div className={styles.page_header_avatar_icon}>{avatarIcon}</div>
        <div className={styles.page_header_avatar_info}>
          <span className={styles.page_header_avatar_name}>{currentUser.name}</span>
          {role
            ? <span className={styles.page_header_avatar_sub}>{role}</span>
            : <span className={styles.page_header_avatar_sub}>Lv.{currentUser.level}</span>
          }
        </div>
      </div>
      {xpBadge && <span className={styles.page_header_xp_badge}>{xpBadge}</span>}
    </header>
  );
}
