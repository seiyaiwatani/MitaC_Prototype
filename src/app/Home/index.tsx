"use client";

import Link from "next/link";
import { repoCas, projects } from "@/lib/mock-data";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

const REPORT_STATUS = [
  { key: "start",    label: "始業報告", done: true,  href: "/report/start" },
  { key: "end",      label: "終業報告", done: false, href: "/report/end" },
  { key: "overtime", label: "残業報告", done: false, href: "/report/overtime" },
];

export default function Home() {
  const todayRepoCas = repoCas.slice(0, 4);
  const completedCount = todayRepoCas.filter((r) => r.isCompleted).length;
  const getProject = (pid: string) => projects.find((p) => p.id === pid);

  return (
    <div className="page-root">
      <PageHeader background="linear-gradient(90deg,#4f46e5,#7c3aed)" />

      <div className={`page-body ${styles.home_body}`}>

        {/* 左カラム: 本日のタスク */}
        <div className={styles.home_task_column}>
          <div className={styles.home_task_title}>～本日のタスク～</div>
          <div className="scroll-y" style={{ flex: 1 }}>
            {todayRepoCas.map((rc) => {
              const proj = getProject(rc.projectId);
              return (
                <div key={rc.id} className={`card ${styles.home_task_card}`}>
                  <div className={styles.home_task_card_tags}>
                    <span className={`chip chip-indigo ${styles.home_task_card_chip_proj}`}>
                      {proj?.name}
                    </span>
                    <span className={`chip chip-gray ${styles.home_task_card_chip_scope}`}>{rc.implScope}</span>
                    {rc.isFavorite && <span style={{ fontSize: 11 }}>⭐</span>}
                  </div>
                  <p className={styles.home_task_card_content}>{rc.content}</p>
                  <div className={styles.home_task_card_footer}>
                    <span className={styles.home_task_card_type}>{rc.taskType}</span>
                    <span className={`${styles.home_task_card_check} ${rc.isCompleted ? styles["home_task_card_check--done"] : styles["home_task_card_check--undone"]}`}>
                      {rc.isCompleted ? "✓" : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右カラム: 報告ステータス */}
        <div className={styles.home_status_column}>
          <div className={styles.home_status_title}>〜報告ステータス〜</div>

          {REPORT_STATUS.map((s) => (
            <Link key={s.key} href={s.href} className={styles.home_status_item}>
              <span className={styles.home_status_item_label}>{s.label}</span>
              <span className={`${styles.home_status_item_badge} ${s.done ? styles["home_status_item_badge--done"] : styles["home_status_item_badge--pending"]}`}>
                {s.done ? "提出済" : "未提出"}
              </span>
            </Link>
          ))}

          <div className={styles.home_completed_row}>
            <span className={styles.home_completed_row_label}>完了タスク</span>
            <span className={styles.home_completed_row_count}>
              {completedCount}/{todayRepoCas.length}
            </span>
          </div>

          <Link href="/repoca/new" className={styles.home_repoca_link}>
            + RepoCa作成
          </Link>
        </div>
      </div>

      {/* フッター */}
      <div className={styles.home_footer}>
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
