"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { currentUser } from "@/lib/mock-data";
import styles from "./OvertimeReport.module.scss";

export default function OvertimeReport() {
  const router = useRouter();
  const [hasOvertime, setHasOvertime] = useState<boolean | null>(null);
  const [hours,   setHours]   = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [content, setContent] = useState("");
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);

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
      <header className={styles.OvertimeReport_header}>
        <span className={styles.OvertimeReport_logo}>Mita=C</span>
        <div className={styles.OvertimeReport_xpSection}>
          <div className={styles.OvertimeReport_xpLabels}>
            <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
          </div>
          <div className={styles.OvertimeReport_xpTrack}>
            <div className={styles.OvertimeReport_xpFill} style={{ width: `${xpPct}%` }} />
          </div>
        </div>
        <div className={styles.OvertimeReport_avatarSection}>
          <span className={styles.OvertimeReport_avatarHint}>アバター→</span>
          <div className={styles.OvertimeReport_avatarIcon}>⚔️</div>
          <div className={styles.OvertimeReport_avatarInfo}>
            <span className={styles.OvertimeReport_avatarName}>{currentUser.name}</span>
            <span className={styles.OvertimeReport_avatarLevel}>Lv.{currentUser.level}</span>
          </div>
        </div>
      </header>

      <div className={`page-body ${styles.OvertimeReport_body}`}>

        {/* 残業有無 */}
        <div className={`card ${styles.OvertimeReport_toggleCard}`}>
          <div className={styles.OvertimeReport_toggleCard_title}>残業はありますか？</div>
          <div className={styles.OvertimeReport_toggleGrid}>
            <button
              onClick={() => setHasOvertime(true)}
              className={`${styles.OvertimeReport_toggleBtn} ${hasOvertime === true ? styles["OvertimeReport_toggleBtn--yes"] : styles["OvertimeReport_toggleBtn--yes-idle"]}`}
            >
              <span className={styles.OvertimeReport_toggleBtn_emoji}>🌙</span>
              残業あり
            </button>
            <button
              onClick={() => setHasOvertime(false)}
              className={`${styles.OvertimeReport_toggleBtn} ${hasOvertime === false ? styles["OvertimeReport_toggleBtn--no"] : styles["OvertimeReport_toggleBtn--no-idle"]}`}
            >
              <span className={styles.OvertimeReport_toggleBtn_emoji}>✅</span>
              残業なし
            </button>
          </div>
        </div>

        {/* 残業詳細 */}
        {hasOvertime === true && (
          <div className={`card ${styles.OvertimeReport_detailCard}`}>
            <div className={styles.OvertimeReport_detailCard_title}>残業詳細</div>
            <div>
              <label className={styles.OvertimeReport_fieldLabel}>残業時間</label>
              <div className={styles.OvertimeReport_timeRow}>
                <select
                  className={styles.OvertimeReport_timeSelect}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                >
                  {[0, 1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{h}時間</option>)}
                </select>
                <select
                  className={styles.OvertimeReport_timeSelect}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                >
                  {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{m}分</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={styles.OvertimeReport_fieldLabel}>残業内容</label>
              <textarea
                className={styles.OvertimeReport_textarea}
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
          <div className={styles.OvertimeReport_noOvertimeMsg}>
            <span className={styles.OvertimeReport_noOvertimeMsg_emoji}>🎉</span>
            <div>
              <p className={styles.OvertimeReport_noOvertimeMsg_title}>お疲れ様でした！</p>
              <p className={styles.OvertimeReport_noOvertimeMsg_sub}>
                定時退社でミッションボーナスの対象です
              </p>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className={styles.OvertimeReport_footer}>
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
