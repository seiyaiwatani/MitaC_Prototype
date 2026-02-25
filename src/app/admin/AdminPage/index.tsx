"use client";

import { useState } from "react";
import { projects, currentUser } from "@/lib/mock-data";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

/* ── モックデータ ── */
const TEAM_MEMBERS = [
  { id: "m1", name: "田中 太郎", reported: true },
  { id: "m2", name: "鈴木 花子", reported: true },
  { id: "m3", name: "佐藤 健",   reported: false },
  { id: "m4", name: "山田 優",   reported: true },
  { id: "m5", name: "伊藤 舞",   reported: true },
];

const PROJ_COLOR: Record<string, string> = {
  p1: "#4f46e5", p2: "#10b981", p3: "#f59e0b", p4: "#ef4444",
};

const DAILY_WORK: Record<string, { projectId: string; min: number }[]> = {
  m1: [{ projectId: "p1", min: 240 }, { projectId: "p2", min: 120 }],
  m2: [{ projectId: "p1", min: 180 }, { projectId: "p3", min: 180 }],
  m3: [{ projectId: "p2", min: 300 }, { projectId: "p4", min: 60  }],
  m4: [{ projectId: "p4", min: 240 }],
  m5: [{ projectId: "p1", min: 120 }, { projectId: "p2", min: 120 }, { projectId: "p3", min: 60 }],
};

const MONTHLY_WORK: Record<string, boolean[]> = {
  m1: Array.from({ length: 24 }, (_, i) => i % 7 < 5),
  m2: Array.from({ length: 24 }, (_, i) => i % 7 < 5 && i !== 10),
  m3: Array.from({ length: 24 }, (_, i) => i % 7 < 5 && i > 2),
  m4: Array.from({ length: 24 }, (_, i) => i % 7 < 5),
  m5: Array.from({ length: 24 }, (_, i) => i % 7 < 5 && i !== 15),
};

type View = "projects" | "daily" | "monthly" | "new-project";

const NAV_ITEMS: { key: View; label: string; icon: string }[] = [
  { key: "projects",    label: "プロジェクト一覧", icon: "📁" },
  { key: "daily",       label: "工数管理/日",      icon: "📊" },
  { key: "monthly",     label: "工数管理/月",      icon: "📅" },
  { key: "new-project", label: "プロジェクト作成", icon: "➕" },
];

export default function AdminPage() {
  const [view, setView]         = useState<View>("projects");
  const [search, setSearch]     = useState("");
  const [projName, setProjName] = useState("");
  const [projMemo, setProjMemo] = useState("");

  return (
    <div className="page-root">
      <PageHeader role="管理者" />

      {/* サイドバー＋コンテンツ */}
      <div className="page-body admin-layout">

        {/* サイドバー */}
        <div className="admin-sidebar">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              className={`admin-nav-item ${view === n.key ? "active" : ""}`}
              style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}
              onClick={() => setView(n.key)}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className="admin-content">

          {/* ── プロジェクト一覧 ── */}
          {view === "projects" && (
            <>
              <div className={styles.admin_search_row}>
                <input
                  className={styles.admin_search_input}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="プロジェクト検索..."
                />
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 11, padding: "5px 14px", whiteSpace: "nowrap" }}
                  onClick={() => setView("new-project")}
                >
                  + 登録
                </button>
              </div>

              <div className={styles.admin_proj_list}>
                {projects
                  .filter((p) => p.name.includes(search))
                  .map((p) => (
                    <div key={p.id} className={`card ${styles.admin_proj_card}`}>
                      <div className={styles.admin_proj_card_left}>
                        <div className={styles.admin_proj_card_title_row}>
                          <div className={styles.admin_proj_card_dot} style={{ background: PROJ_COLOR[p.id] ?? "#6b7280" }} />
                          <span className={styles.admin_proj_card_name}>{p.name}</span>
                        </div>
                        <div className={styles.admin_proj_card_meta}>チームID: {p.teamId} ｜ 進行中</div>
                      </div>
                      <div className={styles.admin_proj_card_actions}>
                        <button className="btn btn-ghost" style={{ fontSize: 10, padding: "3px 10px" }}>編集</button>
                        <button className="btn btn-danger" style={{ fontSize: 10, padding: "3px 10px" }}>削除</button>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* ── 工数管理/日 ── */}
          {view === "daily" && (
            <>
              <div className={styles.admin_daily_title}>工数管理 / 日 — 2026/02/24</div>

              <div className={styles.admin_legend}>
                {projects.map((p) => (
                  <div key={p.id} className={styles.admin_legend_item}>
                    <div className={styles.admin_legend_dot} style={{ background: PROJ_COLOR[p.id] }} />
                    <span className={styles.admin_legend_label}>{p.name}</span>
                  </div>
                ))}
              </div>

              <div className={styles.admin_bar_list}>
                {TEAM_MEMBERS.map((m) => {
                  const segs  = DAILY_WORK[m.id] ?? [];
                  const total = segs.reduce((s, x) => s + x.min, 0);
                  const maxMin = 480;
                  return (
                    <div key={m.id} className={styles.admin_bar_row}>
                      <div className={styles.admin_bar_row_name}>{m.name.split(" ")[0]}</div>
                      <div className={styles.admin_bar_row_track}>
                        {segs.map((seg, i) => (
                          <div
                            key={i}
                            className={styles.admin_bar_row_seg}
                            title={`${projects.find((p) => p.id === seg.projectId)?.name}: ${seg.min / 60}h`}
                            style={{
                              width: `${(seg.min / maxMin) * 100}%`,
                              height: "100%",
                              background: PROJ_COLOR[seg.projectId],
                              borderRight: i < segs.length - 1 ? "1px solid rgba(255,255,255,0.4)" : "none",
                            }}
                          />
                        ))}
                      </div>
                      <span className={styles.admin_bar_row_total}>{(total / 60).toFixed(1)}h</span>
                      <span className={`${styles.admin_bar_row_status} ${m.reported ? styles["admin_bar_row_status--reported"] : styles["admin_bar_row_status--pending"]}`}>
                        {m.reported ? "報告済" : "未報告"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.admin_x_axis}>
                <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
              </div>
            </>
          )}

          {/* ── 工数管理/月 ── */}
          {view === "monthly" && (
            <>
              <div className={styles.admin_monthly_title}>工数管理 / 月 — 2026年2月</div>
              <div style={{ overflowX: "auto" }}>
                <table className={styles.admin_monthly_table}>
                  <thead>
                    <tr>
                      <th className={styles.admin_monthly_table_th}>氏名</th>
                      {Array.from({ length: 24 }, (_, i) => (
                        <th key={i} className={styles.admin_monthly_table_th_day}>{i + 1}</th>
                      ))}
                      <th className={styles.admin_monthly_table_th_total}>合計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_MEMBERS.map((m) => {
                      const days  = MONTHLY_WORK[m.id] ?? [];
                      const total = days.filter(Boolean).length;
                      return (
                        <tr key={m.id}>
                          <td className={styles.admin_monthly_table_td_name}>{m.name.split(" ")[0]}</td>
                          {days.map((worked, i) => (
                            <td key={i} className={styles.admin_monthly_table_td_day}>
                              <div
                                className={styles.admin_monthly_table_dot}
                                style={{ background: worked ? "#4f46e5" : "#e5e7eb" }}
                              />
                            </td>
                          ))}
                          <td className={styles.admin_monthly_table_td_total}>{total}日</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── プロジェクト作成 ── */}
          {view === "new-project" && (
            <>
              <div className={styles.admin_new_proj_title}>プロジェクト作成</div>
              <div className={`card ${styles.admin_new_proj_card}`}>
                <div className={styles.admin_new_proj_field}>
                  <label className={styles.admin_new_proj_label}>プロジェクト名</label>
                  <input
                    className={styles.admin_new_proj_input}
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    placeholder="例: 社内基盤システム刷新"
                  />
                </div>
                <div className={styles.admin_new_proj_field}>
                  <label className={styles.admin_new_proj_label}>メモ</label>
                  <textarea
                    className={styles.admin_new_proj_textarea}
                    value={projMemo}
                    onChange={(e) => setProjMemo(e.target.value)}
                    placeholder="プロジェクトの概要・備考"
                    rows={4}
                  />
                </div>
                <div className={styles.admin_new_proj_footer}>
                  <button className="btn btn-ghost" style={{ flex: 1, fontSize: 12 }} onClick={() => setView("projects")}>
                    キャンセル
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, fontSize: 12 }}
                    disabled={!projName.trim()}
                    onClick={() => {
                      alert(`「${projName}」を登録しました`);
                      setProjName(""); setProjMemo("");
                      setView("projects");
                    }}
                  >
                    登録
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
