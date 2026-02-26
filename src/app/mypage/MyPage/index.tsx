"use client";

import { useState } from "react";
import { currentUser, badges, missions } from "@/lib/mock-data";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

const AVATARS = [
  { id: "warrior", icon: "⚔️", name: "戦士" },
  { id: "mage",    icon: "🧙", name: "魔法使い" },
  { id: "archer",  icon: "🏹", name: "弓使い" },
  { id: "knight",  icon: "🛡️", name: "騎士" },
];

const NOTICES = [
  "◇ 新機能追加！バッジシートが追加されました",
  "◇ 1月10日にメンテナンスを実施します",
  "◇ 今月のTOPユーザーに特別ボーナスをプレゼント",
];

export default function MyPage() {
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const acquiredBadges = badges.filter((b) => b.acquired);
  const lockedBadges   = badges.filter((b) => !b.acquired);
  const currentAvatarIcon = AVATARS.find((a) => a.id === avatar)?.icon ?? "⚔️";

  const missionGroups = [
    { type: "daily",     label: "デイリー", icon: "📅" },
    { type: "monthly",   label: "マンスリー", icon: "📆" },
    { type: "unlimited", label: "無期限",    icon: "♾️" },
  ] as const;

  return (
    <div className="page-root">
      <PageHeader
        background="linear-gradient(90deg,#7c3aed,#db2777)"
        avatarIcon={currentAvatarIcon}
      />

      {/* お知らせバー */}
      <div className={styles.my_page_notice}>
        <div className={styles.my_page_notice_badge}>お知らせ</div>
        <div className={styles.my_page_notice_list}>
          {NOTICES.map((notice, i) => (
            <span key={i}>{notice}</span>
          ))}
        </div>
      </div>

      <div className={`page-body ${styles.my_page_body}`}>

        {/* 左カラム */}
        <div className={styles.my_page_left_col}>

          {/* フィジカルカード */}
          <div className={`card ${styles.my_page_character_card}`}>
            <div className={styles.my_page_character_card_avatar}>{currentAvatarIcon}</div>
            <div className={styles.my_page_character_card_name}>{currentUser.name}</div>
            <span className={styles.my_page_character_card_level}>Lv.{currentUser.level}</span>
            <div className={styles.my_page_character_card_xp_row}>
              <div className={styles.my_page_character_card_xp_labels}>
                <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
              </div>
              <div className="xp-bar"><div className="xp-bar-fill" style={{ width: `${xpPct}%` }} /></div>
            </div>
            <div>
              <span className={styles.my_page_character_card_currency}>
                💰 {currentUser.currency.toLocaleString()}
              </span>
            </div>
          </div>

          {/* アバター選択 */}
          <div className={`card ${styles.my_page_avatar_card}`}>
            <div className={styles.my_page_avatar_card_label}>アバター</div>
            <div className={styles.my_page_avatar_grid}>
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(a.id)}
                  className={`${styles.my_page_avatar_btn} ${avatar === a.id ? styles["my_page_avatar_btn--active"] : styles["my_page_avatar_btn--idle"]}`}
                >
                  {a.icon}
                  <span className={`${styles.my_page_avatar_btn_label} ${avatar === a.id ? styles["my_page_avatar_btn_label--active"] : styles["my_page_avatar_btn_label--idle"]}`}>
                    {a.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 工数報告 */}
          <div className={`card ${styles.my_page_workhour_card}`}>
            <div className={styles.my_page_workhour_card_label}>今月の工数報告</div>
            <button className="btn btn-ghost" style={{ width: "100%", padding: "6px", fontSize: 11 }}>
              工数確認
            </button>
          </div>
        </div>

        {/* 右カラム */}
        <div className={styles.my_page_right_col}>

          {/* バッジ */}
          <div className={`card ${styles.my_page_badge_card}`}>
            <div className={styles.my_page_badge_card_title}>
              🏅 バッジ ({acquiredBadges.length}/{badges.length})
            </div>
            <div className={styles.my_page_badge_list}>
              {acquiredBadges.map((b) => (
                <div key={b.id} title={`${b.name}: ${b.description}`}
                  className={`${styles.my_page_badge} ${styles["my_page_badge--acquired"]}`}>
                  {b.icon}
                </div>
              ))}
              {lockedBadges.map((b) => (
                <div key={b.id} title={b.description}
                  className={`${styles.my_page_badge} ${styles["my_page_badge--locked"]}`}>
                  {b.icon}
                </div>
              ))}
            </div>
          </div>

          {/* ミッション */}
          <div className={styles.my_page_mission_grid}>
            {missionGroups.map(({ type, label, icon }) => {
              const items = missions.filter((m) => m.type === type);
              return (
                <div key={type} className={`card ${styles.my_page_mission_col}`}>
                  <div className={styles.my_page_mission_col_title}>{icon} {label}ミッション</div>
                  <div className="scroll-y" style={{ flex: 1 }}>
                    {items.map((m) => {
                      const pct = Math.round((m.progress / m.goal) * 100);
                      const done = pct >= 100;
                      return (
                        <div key={m.id} className={styles.my_page_mission}>
                          <div className={styles.my_page_mission_header}>
                            <span className={styles.my_page_mission_title}>{m.title}</span>
                            <span className="chip chip-yellow" style={{ fontSize: 9 }}>+{m.reward}💰</span>
                          </div>
                          <p className={styles.my_page_mission_desc}>{m.description}</p>
                          <div className={styles.my_page_mission_bar_row}>
                            <div className={styles.my_page_mission_track}>
                              <div
                                className={styles.my_page_mission_fill}
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background: done
                                    ? "linear-gradient(90deg,#f59e0b,#d97706)"
                                    : "linear-gradient(90deg,#7c3aed,#db2777)",
                                }}
                              />
                            </div>
                            <span className={styles.my_page_mission_count}>{m.progress}/{m.goal}</span>
                          </div>
                          {done && (
                            <div className={styles.my_page_mission_bonus}>達成ボーナス！</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
