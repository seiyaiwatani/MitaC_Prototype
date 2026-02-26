"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects } from "@/lib/mock-data";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

const DURATIONS = [0, 15, 30, 45, 60, 90, 120, 150, 180, 240];

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#35f5b5", バック: "#694de4", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#757575",
};

const fmt = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
};

export default function EndReport() {
  const router = useRouter();
  const todayIds = ["rc1", "rc2", "rc3"];
  const [durations, setDurations]       = useState<Record<string, number>>({ rc1: 120, rc2: 90, rc3: 60 });
  const [completed, setCompleted]       = useState<Record<string, boolean>>({ rc1: false, rc2: false, rc3: true });
  const [extraIds,  setExtraIds]        = useState<string[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const allSelectedIds = [...todayIds, ...extraIds];
  const available      = repoCas.filter((r) => !allSelectedIds.includes(r.id));
  const totalMin       = allSelectedIds.reduce((s, id) => s + (durations[id] ?? 0), 0);
  const totalXp        = allSelectedIds.reduce((s, id) => {
    const rc = repoCas.find((r) => r.id === id);
    return s + (rc?.xp ?? 0) + (completed[id] ? 10 : 0);
  }, 0);

  const getProj = (pid: string) => projects.find((p) => p.id === pid);

  const addExtra = (id: string) =>
    setExtraIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  /* ── 確認画面 ── */
  if (showConfirm) {
    return (
      <div className="page-root">
        <PageHeader background="linear-gradient(90deg,#f59e0b,#d97706)" />
        <div className={`page-body ${styles.end_report_confirm_body}`}>
          <div className={styles.end_report_confirm_title}>🌇 終業報告 — 確認</div>
          <div className={`card ${styles.end_report_status_card}`}>
            <div className={styles.end_report_status_card_title}>確認ステータス</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ label: "始業報告", ok: true }, { label: "終業報告", ok: true }, { label: "残業報告", ok: false }].map((r) => (
                <div key={r.label} className={styles.end_report_status_row}>
                  <span>{r.label}</span>
                  <span className={r.ok ? "status-ok" : "status-ng"}>{r.ok ? "確認済" : "未確認"}</span>
                </div>
              ))}
              <div className={styles.end_report_summary_row}>
                <span>完了タスク</span>
                <span className={styles.end_report_summary_value}>{Object.values(completed).filter(Boolean).length}/{allSelectedIds.length}</span>
              </div>
              <div className={styles.end_report_summary_row}>
                <span>総工数</span>
                <span className={styles.end_report_summary_value}>{fmt(totalMin)}</span>
              </div>
              <div className={styles.end_report_summary_row}>
                <span>獲得XP</span>
                <span className={styles.end_report_xp_value}>+{totalXp} XP</span>
              </div>
            </div>
          </div>
          <div className={styles.end_report_confirm_footer}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>戻る</button>
            <button
              className="btn"
              style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
              onClick={() => { alert(`終業報告を提出！\n総工数: ${fmt(totalMin)}\n+${totalXp} XP`); router.push("/"); }}
            >
              提出
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── メイン画面 ── */
  return (
    <div className="page-root">
      <PageHeader background="linear-gradient(90deg,#f59e0b,#d97706)" />

      <div className={`page-body ${styles.end_report_body}`}>

        {/* 左・メインエリア */}
        <div className={styles.end_report_chart_area}>
          <div className={styles.end_report_chart_title}>
            🌇 本日の工数 — {fmt(totalMin)}
          </div>

          <div className={styles.end_report_legend}>
            {Object.entries(SCOPE_COLOR).map(([scope, color]) => (
              <div key={scope} className={styles.end_report_legend_item}>
                <div className={styles.end_report_legend_dot} style={{ background: color }} />
                <span className={styles.end_report_legend_label}>{scope}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div className="scroll-y" style={{ height: "100%" }}>
              {allSelectedIds.map((id) => {
                const rc = repoCas.find((r) => r.id === id);
                if (!rc) return null;
                const proj = getProj(rc.projectId);
                const dur = durations[id] ?? 0;
                const done = completed[id] ?? false;
                const barPct = Math.min((dur / 480) * 100, 100);
                const color = SCOPE_COLOR[rc.implScope] ?? "#757575";

                return (
                  <div key={id} className={styles.end_report_bar_item}>
                    <div className={styles.end_report_bar_item_header}>
                      <button
                        className={styles.end_report_bar_item_check}
                        style={{
                          border: `2px solid ${done ? "#10b981" : "#d1d5db"}`,
                          background: done ? "#10b981" : "white",
                        }}
                        onClick={() => setCompleted((p) => ({ ...p, [id]: !p[id] }))}
                      >
                        {done ? "✓" : ""}
                      </button>
                      <span className={`chip chip-indigo ${styles.end_report_bar_item_proj_chip}`}>
                        {proj?.name}
                      </span>
                      <span className={styles.end_report_bar_item_task_name}>{rc.content}</span>
                      {done && <span className={styles.end_report_bar_item_bonus}>+10XP</span>}
                    </div>

                    <div className={styles.end_report_bar_row}>
                      <div className={styles.end_report_bar_row_label}>
                        {dur === 0 ? "0分" : fmt(dur)}
                      </div>
                      <div className={styles.end_report_bar_row_track}>
                        <div
                          className={styles.end_report_bar_row_fill}
                          style={{ width: `${barPct}%`, background: color }}
                        />
                        {[25, 50, 75].map((pct) => (
                          <div key={pct} className={styles.end_report_bar_row_grid} style={{ left: `${pct}%` }} />
                        ))}
                      </div>
                      <select
                        className={styles.end_report_bar_row_select}
                        value={durations[id] ?? 0}
                        onChange={(e) => setDurations((p) => ({ ...p, [id]: Number(e.target.value) }))}
                      >
                        {DURATIONS.map((d) => <option key={d} value={d}>{d === 0 ? "0分" : fmt(d)}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.end_report_x_axis}>
            <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
          </div>
        </div>

        {/* 右パネル: 追加可能RepoCa */}
        {showAddPanel && (
          <div className={styles.end_report_add_panel}>
            <div className={styles.end_report_add_panel_header}>
              <span>RepoCaを追加</span>
              <button className={styles.end_report_add_panel_close} onClick={() => setShowAddPanel(false)}>✕</button>
            </div>
            <div className="scroll-y" style={{ flex: 1, padding: 8 }}>
              {available.map((rc) => {
                const isExtra = extraIds.includes(rc.id);
                const proj = getProj(rc.projectId);
                return (
                  <div
                    key={rc.id}
                    className={`repoca-card ${isExtra ? "selected" : ""}`}
                    style={{ marginBottom: 6 }}
                    onClick={() => addExtra(rc.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className={`chip chip-indigo ${styles.end_report_add_panel_item_proj}`}>{proj?.name}</span>
                        <p className={styles.end_report_add_panel_item_content}>{rc.content}</p>
                      </div>
                      <span style={{ fontSize: 14, marginLeft: 6 }}>{isExtra ? "✅" : "⬜"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className={styles.end_report_footer}>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: "7px 14px" }}
          onClick={() => setShowAddPanel((p) => !p)}
        >
          + RepoCaを追加
        </button>
        <div className={styles.end_report_footer_spacer} />
        <Link href="/">
          <button className="btn btn-ghost" style={{ fontSize: 12 }}>戻る</button>
        </Link>
        <button
          className="btn"
          style={{ fontSize: 12, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white", padding: "7px 24px" }}
          onClick={() => setShowConfirm(true)}
        >
          提出
        </button>
      </div>
    </div>
  );
}
