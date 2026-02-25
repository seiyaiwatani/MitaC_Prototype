"use client";

import Link from "next/link";
import { currentUser, repoCas, projects } from "@/lib/mock-data";
import styles from "./Home.module.scss";

const REPORT_STATUS = [
  { key: "start",    label: "始業報告", done: true,  href: "/report/start" },
  { key: "end",      label: "終業報告", done: false, href: "/report/end" },
  { key: "overtime", label: "残業報告", done: false, href: "/report/overtime" },
];

export default function Home() {
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const todayRepoCas = repoCas.slice(0, 4);
  const completedCount = todayRepoCas.filter((r) => r.isCompleted).length;
  const getProject = (pid: string) => projects.find((p) => p.id === pid);

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header className={styles.Home_header}>
        <span className={styles.Home_logo}>Mita=C</span>

        <div className={styles.Home_xpSection}>
          <div className={styles.Home_xpLabels}>
            <span>XP</span>
            <span>{currentUser.xp}/{currentUser.xpToNext}</span>
          </div>
          <div className={styles.Home_xpTrack}>
            <div className={styles.Home_xpFill} style={{ width: `${xpPct}%` }} />
          </div>
        </div>

        <div className={styles.Home_avatarSection}>
          <span className={styles.Home_avatarHint}>アバター→</span>
          <div className={styles.Home_avatarIcon}>⚔️</div>
          <div className={styles.Home_avatarInfo}>
            <span className={styles.Home_avatarName}>{currentUser.name}</span>
            <span className={styles.Home_avatarLevel}>Lv.{currentUser.level}</span>
          </div>
        </div>
      </header>

      {/* メインエリア（2カラム） */}
      <div className={`page-body ${styles.Home_body}`}>

        {/* 左カラム: 本日のタスク */}
        <div className={styles.Home_taskColumn}>
          <div className={styles.Home_taskTitle}>～本日のタスク～</div>
          <div className="scroll-y" style={{ flex: 1 }}>
            {todayRepoCas.map((rc) => {
              const proj = getProject(rc.projectId);
              return (
                <div key={rc.id} className={`card ${styles.Home_taskCard}`}>
                  <div className={styles.Home_taskCard_tags}>
                    <span className={`chip chip-indigo ${styles.Home_taskCard_chipProj}`}>
                      {proj?.name}
                    </span>
                    <span className={`chip chip-gray ${styles.Home_taskCard_chipScope}`}>{rc.implScope}</span>
                    {rc.isFavorite && <span style={{ fontSize: 11 }}>⭐</span>}
                  </div>
                  <p className={styles.Home_taskCard_content}>{rc.content}</p>
                  <div className={styles.Home_taskCard_footer}>
                    <span className={styles.Home_taskCard_type}>{rc.taskType}</span>
                    <span className={`${styles.Home_taskCard_check} ${rc.isCompleted ? styles["Home_taskCard_check--done"] : styles["Home_taskCard_check--undone"]}`}>
                      {rc.isCompleted ? "✓" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右カラム: 報告ステータス */}
        <div className={styles.Home_statusColumn}>
          <div className={styles.Home_statusTitle}>〜報告ステータス〜</div>

          {REPORT_STATUS.map((s) => (
            <Link key={s.key} href={s.href} className={styles.Home_statusItem}>
              <span className={styles.Home_statusItem_label}>{s.label}</span>
              <span className={`${styles.Home_statusItem_badge} ${s.done ? styles["Home_statusItem_badge--done"] : styles["Home_statusItem_badge--pending"]}`}>
                {s.done ? "提出済" : "未提出"}
              </span>
            </Link>
          ))}

          <div className={styles.Home_completedRow}>
            <span className={styles.Home_completedRow_label}>完了タスク</span>
            <span className={styles.Home_completedRow_count}>
              {completedCount}/{todayRepoCas.length}
            </span>
          </div>

          <Link href="/repoca/new" className={styles.Home_repocaLink}>
            + RepoCa作成
          </Link>
        </div>
      </div>

      {/* フッター */}
      <div className={styles.Home_footer}>
        <Link href="/report/start">
          <button className="btn btn-primary" style={{ fontSize: 13, minWidth: 120 }}>
            🌅 始業報告
          </button>
        </Link>
        <Link href="/report/end">
          <button className="btn" style={{ fontSize: 13, minWidth: 120, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}>
            🌇 終業報告
          </button>
        </Link>
        <Link href="/report/overtime">
          <button className="btn" style={{ fontSize: 13, minWidth: 120, background: "linear-gradient(90deg,#6b7280,#4b5563)", color: "white" }}>
            🌙 残業報告
          </button>
        </Link>
      </div>
    </div>
  );
}
