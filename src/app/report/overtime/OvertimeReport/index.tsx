"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

export default function OvertimeReport() {
  const router = useRouter();
  const [hasOvertime, setHasOvertime] = useState<boolean | null>(null);
  const [hours,   setHours]   = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (hasOvertime === null) return;
    const msg = hasOvertime
      ? `残業報告を提出しました。\n残業時間: ${hours}時間${minutes > 0 ? minutes + "分" : ""}`
      : "残業なしで報告を提出しました。お疲れ様でした！";
    alert(msg);
    router.push("/");
  };

  return (
    <div className="page-root">
      <PageHeader />

      <div className={`page-body ${styles.overtime_report_body}`}>

        {/* 残業有無 */}
        <div className={`card ${styles.overtime_report_toggle_card}`}>
          <div className={styles.overtime_report_toggle_card_title}>残業はありますか？</div>
          <div className={styles.overtime_report_toggle_grid}>
            <button
              onClick={() => setHasOvertime(true)}
              className={`${styles.overtime_report_toggle_btn} ${hasOvertime === true ? styles["overtime_report_toggle_btn--yes"] : styles["overtime_report_toggle_btn--yes_idle"]}`}
            >
              <span className={styles.overtime_report_toggle_btn_emoji}>🌙</span>
              残業あり
            </button>
            <button
              onClick={() => setHasOvertime(false)}
              className={`${styles.overtime_report_toggle_btn} ${hasOvertime === false ? styles["overtime_report_toggle_btn--no"] : styles["overtime_report_toggle_btn--no_idle"]}`}
            >
              <span className={styles.overtime_report_toggle_btn_emoji}>✅</span>
              残業なし
            </button>
          </div>
        </div>

        {/* 残業詳細 */}
        {hasOvertime === true && (
          <div className={`card ${styles.overtime_report_detail_card}`}>
            <div className={styles.overtime_report_detail_card_title}>残業詳細</div>
            <div>
              <label className={styles.overtime_report_field_label}>残業時間</label>
              <div className={styles.overtime_report_time_row}>
                <select
                  className={styles.overtime_report_time_select}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{h}時間</option>)}
                </select>
                <select
                  className={styles.overtime_report_time_select}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                >
                  {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{m}分</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={styles.overtime_report_field_label}>残業内容</label>
              <textarea
                className={styles.overtime_report_textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="残業で行う作業内容を入力してください..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* 定時退社メッセージ */}
        {hasOvertime === false && (
          <div className={styles.overtime_report_no_overtime_msg}>
            <span className={styles.overtime_report_no_overtime_msg_emoji}>🎉</span>
            <div>
              <p className={styles.overtime_report_no_overtime_msg_title}>お疲れ様でした！</p>
              <p className={styles.overtime_report_no_overtime_msg_sub}>
                定時退社でミッションボーナスの対象です
              </p>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className={styles.overtime_report_footer}>
          <Link href="/" style={{ flex: 1 }}>
            <button className="btn btn-ghost" style={{ width: "100%" }}>キャンセル</button>
          </Link>
          <button
            className="btn"
            style={{
              flex: 2, color: "white",
              background: hasOvertime === null ? "#d1d5db" : "linear-gradient(90deg,#1e1b4b,#312e81)",
            }}
            disabled={hasOvertime === null}
            onClick={handleSubmit}
          >
            🌙 提出する
          </button>
        </div>
      </div>
    </div>
  );
}
