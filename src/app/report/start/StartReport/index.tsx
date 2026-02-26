"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects } from "@/lib/mock-data";
import { RepoCa } from "@/types";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};

export default function StartReport() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const favorites  = repoCas.filter((r) => r.isFavorite);
  const others     = repoCas.filter((r) => !r.isFavorite);
  const allCards   = [...favorites, ...others];
  const totalXp    = selected.reduce((s, id) => s + (repoCas.find((r) => r.id === id)?.xp ?? 0), 0);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const getProj = (pid: string) => projects.find((p) => p.id === pid);

  const RepoCaItem = ({ rc, mini = false }: { rc: RepoCa; mini?: boolean }) => {
    const isSelected = selected.includes(rc.id);
    return (
      <div
        className={`repoca-card ${isSelected ? "selected" : ""}`}
        style={{ marginBottom: 6 }}
        onClick={() => toggle(rc.id)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={styles.start_report_repoca_item_tags}>
              <span className={`chip chip-indigo ${styles.start_report_repoca_item_proj_chip}`}>
                {getProj(rc.projectId)?.name}
              </span>
              <span className="chip" style={{ background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
                {rc.implScope}
              </span>
            </div>
            <p style={{ fontSize: mini ? 11 : 12, fontWeight: 500, color: "#1f2937", margin: 0, lineHeight: 1.3 }}>
              {rc.content}
            </p>
            {!mini && (
              <div className={styles.start_report_repoca_item_footer}>
                <span className={styles.start_report_repoca_item_meta}>{rc.taskType}</span>
                <span className={styles.start_report_repoca_item_meta}>{rc.label}</span>
                {rc.isFavorite && <span className={styles.start_report_repoca_item_meta}>⭐</span>}
                <span className={styles.start_report_repoca_item_xp}>+{rc.xp}XP</span>
              </div>
            )}
          </div>
          <span className={styles.start_report_repoca_item_check}>
            {isSelected ? "✅" : "⬜"}
          </span>
        </div>
      </div>
    );
  };

  /* ── 確認画面 ── */
  if (showConfirm) {
    return (
      <div className="page-root">
        <PageHeader background="linear-gradient(90deg,#4f46e5,#7c3aed)" />
        <div className={`page-body ${styles.start_report_confirm_body}`}>
          <div className={styles.start_report_confirm_title}>🌅 始業報告 — 確認</div>

          <div className={`card ${styles.start_report_status_card}`}>
            <div className={styles.start_report_status_card_title}>確認ステータス</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "始業報告", ok: true },
                { label: "終業報告", ok: false },
                { label: "残業報告", ok: false },
              ].map((row) => (
                <div key={row.label} className={styles.start_report_status_row}>
                  <span>{row.label}</span>
                  <span className={row.ok ? "status-ok" : "status-ng"}>{row.ok ? "確認済" : "未確認"}</span>
                </div>
              ))}
              <div className={styles.start_report_summary_row}>
                <span>完了タスク</span>
                <span className={styles.start_report_summary_value}>0/{selected.length}</span>
              </div>
              <div className={styles.start_report_summary_row}>
                <span>獲得XP（予定）</span>
                <span className={styles.start_report_xp_value}>+{totalXp} XP</span>
              </div>
            </div>
          </div>

          <div className={`card ${styles.start_report_selected_card}`}>
            <div className={styles.start_report_selected_card_title}>
              選択済み RepoCa（{selected.length}枚）
            </div>
            {selected.map((id) => {
              const rc = repoCas.find((r) => r.id === id);
              if (!rc) return null;
              const proj = getProj(rc.projectId);
              return (
                <div key={id} className={styles.start_report_selected_item}>
                  <span className={styles.start_report_selected_item_check}>✓</span>
                  <span className="chip chip-indigo" style={{ fontSize: 10 }}>{proj?.name}</span>
                  <span className={styles.start_report_selected_item_content}>{rc.content}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.start_report_confirm_footer}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>戻る</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => { alert("始業報告を提出しました！ 🌟"); router.push("/"); }}
            >
              提出
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 選択画面（2カラム）── */
  return (
    <div className="page-root">
      <PageHeader background="linear-gradient(90deg,#4f46e5,#7c3aed)" />

      <div className={`page-body ${styles.start_report_body}`}>

        {/* 左列: 追加したRepoCa一覧 */}
        <div className={styles.start_report_left_col}>
          <div className={styles.start_report_left_col_header}>
            <span>追加したRepoCa一覧</span>
            <span className="chip chip-indigo">{selected.length}枚</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div className="scroll-y" style={{ height: "100%", padding: 10 }}>
              {selected.length === 0 ? (
                <div className="repoca-card slot-empty" style={{ height: 70 }}>
                  右からカードを選択
                </div>
              ) : (
                selected.map((id) => {
                  const rc = repoCas.find((r) => r.id === id);
                  return rc ? <RepoCaItem key={id} rc={rc} mini /> : null;
                })
              )}
            </div>
          </div>

          <div className={styles.start_report_left_col_footer}>
            <Link href="/" style={{ flex: 1 }}>
              <button className="btn btn-ghost" style={{ width: "100%" }}>戻る</button>
            </Link>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={selected.length === 0}
              onClick={() => setShowConfirm(true)}
            >
              提出（{selected.length}枚）
            </button>
          </div>
        </div>

        {/* 右列: RepoCaデッキ */}
        <div className={styles.start_report_right_col}>
          <div className={styles.start_report_right_col_header}>
            <span>未完了のRepoCa</span>
            <Link href="/repoca/new" className={styles.start_report_right_col_new_link}>+ 新規</Link>
          </div>
          <div className="scroll-y" style={{ flex: 1, padding: 8 }}>
            {favorites.length > 0 && (
              <div className={styles.start_report_favorite_label}>⭐ お気に入り</div>
            )}
            {allCards.map((rc) => (
              <RepoCaItem key={rc.id} rc={rc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
