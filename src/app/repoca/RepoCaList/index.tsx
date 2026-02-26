"use client";

import { useState } from "react";
import Link from "next/link";
import { repoCas, projects, currentUser } from "@/lib/mock-data";
import { RepoCa } from "@/types";
import styles from "./index.module.scss";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};
const TASK_ICON: Record<string, string> = { 開発: "💻", MTG: "🤝", その他: "📌" };

const FILTERS = [
  { key: "all",        label: "すべて" },
  { key: "favorite",   label: "⭐ お気に入り" },
  { key: "incomplete", label: "未完了" },
  { key: "completed",  label: "✓ 完了" },
] as const;

export default function RepoCaList() {
  const [filter, setFilter] = useState<"all" | "favorite" | "incomplete" | "completed">("all");
  const [search, setSearch] = useState("");
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);

  const filtered = repoCas.filter((rc) => {
    const proj = projects.find((p) => p.id === rc.projectId);
    const matchSearch =
      search === "" ||
      rc.content.toLowerCase().includes(search.toLowerCase()) ||
      (proj?.name ?? "").includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "favorite"   && rc.isFavorite) ||
      (filter === "completed"  && rc.isCompleted) ||
      (filter === "incomplete" && !rc.isCompleted);
    return matchSearch && matchFilter;
  });

  const stats = [
    { label: "作成済み", value: repoCas.length, icon: "🃏" },
    { label: "完了",     value: repoCas.filter((r) => r.isCompleted).length, icon: "✅" },
    { label: "総XP",    value: `${repoCas.reduce((s, r) => s + r.xp, 0)}XP`, icon: "⭐" },
  ];

  return (
    <div className="page-root">
      {/* RepoCaListは独自ヘッダー（検索バー付き） */}
      <header className={styles.repoca_list_header}>
        <span className={styles.repoca_list_logo}>Mita=C</span>
        <div className={styles.repoca_list_search}>
          <span className={styles.repoca_list_search_icon}>🔍</span>
          <input
            className={styles.repoca_list_search_input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="検索..."
          />
        </div>
        <div className={styles.repoca_list_xp_section}>
          <div className={styles.repoca_list_xp_labels}>
            <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
          </div>
          <div className={styles.repoca_list_xp_track}>
            <div className={styles.repoca_list_xp_fill} style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <div className={styles.repoca_list_avatar_section}>
          <div className={styles.repoca_list_avatar_icon}>⚔️</div>
          <span className={styles.repoca_list_avatar_name}>{currentUser.name}</span>
        </div>
        <Link href="/repoca/new" className={styles.repoca_list_create_btn}>+ 作成</Link>
      </header>

      <div className={`page-body ${styles.repoca_list_body}`}>

        {/* 統計 */}
        <div className={styles.repoca_list_stats_row}>
          {stats.map((s) => (
            <div key={s.label} className={`card ${styles.repoca_list_stat_card}`}>
              <div className={styles.repoca_list_stat_card_icon}>{s.icon}</div>
              <div className={styles.repoca_list_stat_card_value}>{s.value}</div>
              <div className={styles.repoca_list_stat_card_label}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* フィルター */}
        <div className={styles.repoca_list_filters}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`${styles.repoca_list_filter_btn} ${filter === f.key ? styles["repoca_list_filter_btn--active"] : styles["repoca_list_filter_btn--idle"]}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* カードリスト */}
        <div className="scroll-y" style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div className={styles.repoca_list_empty}>
              <div className={styles.repoca_list_empty_icon}>🃏</div>
              <p className={styles.repoca_list_empty_text}>RepoCaが見つかりませんでした</p>
            </div>
          ) : (
            filtered.map((rc) => <RepoCaCard key={rc.id} rc={rc} />)
          )}
        </div>
      </div>
    </div>
  );
}

function RepoCaCard({ rc }: { rc: RepoCa }) {
  const proj = projects.find((p) => p.id === rc.projectId);
  return (
    <div className={`card ${styles.repoca_card_root}`}>
      <div className={`${styles.repoca_card_check} ${rc.isCompleted ? styles["repoca_card_check--done"] : styles["repoca_card_check--undone"]}`}>
        {rc.isCompleted ? "✓" : ""}
      </div>
      <div className={styles.repoca_card_body}>
        <div className={styles.repoca_card_tags}>
          <span className={styles.repoca_card_task_icon}>{TASK_ICON[rc.taskType]}</span>
          <span className={`chip chip-indigo ${styles.repoca_card_proj_chip}`}>{proj?.name}</span>
          <span className="chip" style={{ fontSize: 10, background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
            {rc.implScope}
          </span>
          {rc.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
        </div>
        <p className={styles.repoca_card_content}>{rc.content}</p>
        <div className={styles.repoca_card_footer}>
          <span className="chip chip-gray" style={{ fontSize: 9 }}>{rc.label}</span>
          <span className={styles.repoca_card_xp}>+{rc.xp} XP</span>
        </div>
      </div>
    </div>
  );
}
