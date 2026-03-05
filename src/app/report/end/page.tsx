"use client";

import { useState } from "react";
import Link from "next/link";
import { repoCas, projects } from "@/lib/mock-data";
import { RepoCa } from "@/types";
import { HiArrowLeft, HiCheck } from "react-icons/hi";
import { fmtDuration, DURATION_OPTIONS } from "@/lib/utils";
import { useRepoCa } from "@/contexts/RepoCaContext";

/** バーグラフ用の短い時間表示 (例: 1h15m, 30分, 2h) */
function shortDur(min: number): string {
  if (min === 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

export default function EndReport() {
  const { todayRepoCas, hasStartReported, hasOvertimeReported, setHasEndReported, resetDailyReports } = useRepoCa();

  const [selectedRepoCas, setSelectedRepoCas] = useState<RepoCa[]>([...todayRepoCas]);
  const [durations, setDurations] = useState<Record<string, number>>(
    Object.fromEntries(todayRepoCas.map((rc) => [rc.id, 0]))
  );
  const [completed, setCompleted] = useState<Record<string, boolean>>(
    Object.fromEntries(todayRepoCas.map((rc) => [rc.id, rc.isCompleted]))
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [hovered, setHovered] = useState<{ id: string; below: boolean } | null>(null);

  const totalMin = selectedRepoCas.reduce((s, rc) => s + (durations[rc.id] ?? 0), 0);

  // サイドバー用
  const unfinished = repoCas.filter((r) => !r.isCompleted && !selectedRepoCas.find((s) => s.id === r.id));
  const favorites  = repoCas.filter((r) => r.isFavorite  && !selectedRepoCas.find((s) => s.id === r.id));

  const addToList = (rc: RepoCa) => {
    setSelectedRepoCas((prev) => [...prev, rc]);
    setDurations((prev) => ({ ...prev, [rc.id]: 0 }));
  };

  // PJでグループ化
  const groupByPj = (rcs: RepoCa[]) => {
    const map = new Map<string, RepoCa[]>();
    rcs.forEach((rc) => {
      const arr = map.get(rc.projectId) ?? [];
      arr.push(rc);
      map.set(rc.projectId, arr);
    });
    return map;
  };
  const grouped = groupByPj(selectedRepoCas);

  // バーグラフ用: PJごとの合計分数
  const pjTotals = Array.from(grouped.entries()).map(([pjId, cards]) => ({
    pjId,
    totalMin: cards.reduce((s, rc) => s + (durations[rc.id] ?? 0), 0),
    proj: projects.find((p) => p.id === pjId)!,
  }));

  /* ── 始業未報告ブロック画面 ── */
  if (!hasStartReported) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>終業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            始業報告が提出されていません
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            終業報告は始業報告を提出した後に<br />行うことができます
          </p>
          <Link href="/report/start">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>始業報告する</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── 残業未報告ブロック画面 ── */
  if (!hasOvertimeReported) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>終業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            残業報告が提出されていません
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            終業報告は残業報告を提出した後に<br />行うことができます
          </p>
          <Link href="/report/overtime">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>残業報告する</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── 完了画面 ── */
  if (showCompleted) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>終業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            本日の報告が完了しました！
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.8 }}>
            お疲れ様でした。<br />
            総工数: {fmtDuration(totalMin)}
          </p>
          <div style={{ marginTop: 12, padding: "14px 20px", borderRadius: 12, background: "#ecfdf5", border: "2px solid #10b981", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#047857", margin: 0, fontWeight: 600 }}>
              ✅ 始業・残業・終業すべての報告が完了
            </p>
          </div>
          <Link href="/">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>ホームに戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── 確認画面 ── */
  if (showConfirm) {
    const completedCount = Object.values(completed).filter(Boolean).length;
    return (
      <div className="page-root">
        <div className="page-subheader">
          <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", padding: 0, display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f59e0b" }}>終業報告 — 確認</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>確認ステータス</div>
            {[{ label: "始業報告", ok: true }, { label: "終業報告", ok: true }, { label: "残業報告", ok: false }].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span>{r.label}</span>
                <span className={r.ok ? "status-ok" : "status-ng"}>{r.ok ? "確認済" : "未確認"}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span>完了タスク</span>
              <span style={{ fontWeight: 700 }}>{completedCount}/{selectedRepoCas.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0" }}>
              <span>総工数</span>
              <span style={{ fontWeight: 700 }}>{fmtDuration(totalMin)}</span>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>修正</button>
          <button className="btn" style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
            onClick={() => { setHasEndReported(true); resetDailyReports(); setShowCompleted(true); }}>
            送信
          </button>
        </div>
      </div>
    );
  }

  /* ── メイン ── */
  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/report" style={{ color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>終業報告</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b7280" }}>
          総工数: {fmtDuration(totalMin)}
        </span>
      </div>

      {/* メインエリア: RepoCa一覧 + 右サイドバー */}
      <div className="page-body" style={{ padding: 8, gap: 8, overflow: "hidden" }}>

        {/* 左: PJグループRepoCa */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {Array.from(grouped.entries()).map(([projId, cards]) => {
            const proj = projects.find((p) => p.id === projId)!;
            return (
              <div key={projId} className="pj-group" style={{ background: proj.color ?? "#f3f4f6", marginBottom: 8 }}>
                <div className="pj-group-header" style={{ color: proj.textColor }}>
                  <span>{proj.icon}</span>
                  <span>{proj.name}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {cards.map((rc) => {
                    const done = completed[rc.id] ?? false;
                    const dur  = durations[rc.id] ?? 0;
                    return (
                      <div
                        key={rc.id}
                        className="card"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHovered({ id: rc.id, below: rect.top < 200 });
                        }}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          padding: "10px 12px",
                          width: 200,
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        {/* ホバー詳細ツールチップ */}
                        {hovered?.id === rc.id && (
                          <div style={{
                            position: "absolute",
                            ...(hovered.below
                              ? { top: "calc(100% + 6px)" }
                              : { bottom: "calc(100% + 6px)" }),
                            left: 0,
                            width: 200,
                            background: "#1a1a2e",
                            color: "white",
                            borderRadius: 10,
                            padding: "10px 12px",
                            zIndex: 50,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                            pointerEvents: "none",
                          }}>
                            <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>{rc.content}</p>
                            {[
                              { label: "種別",   value: rc.taskType },
                              { label: "ラベル", value: rc.label },
                              { label: "範囲",   value: rc.implScope },
                              { label: "XP",     value: `+${rc.xp} XP` },
                              { label: "作成",   value: new Date(rc.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) },
                            ].map(({ label, value }) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                                <span style={{ color: "#9ca3af" }}>{label}</span>
                                <span style={{ fontWeight: 600 }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <span className="chip" style={{ fontSize: 9, background: proj.color, color: proj.textColor }}>{rc.taskType}</span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, color: rc.isFavorite ? "#f59e0b" : "#e5e7eb" }}>
                            ★
                          </button>
                        </div>
                        <p style={{ fontSize: 11, margin: "0 0 6px", fontWeight: 500, color: dur === 0 ? "#ef4444" : "#1f2937", lineHeight: 1.3 }}>
                          {rc.content}
                        </p>
                        {/* 工数セレクト */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <select
                            value={dur}
                            onChange={(e) => setDurations((p) => ({ ...p, [rc.id]: Number(e.target.value) }))}
                            style={{
                              flex: 1, fontSize: 10, border: "1px solid #e5e7eb",
                              borderRadius: 4, padding: "2px 3px",
                            }}
                          >
                            {DURATION_OPTIONS.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* 完了チェック */}
                        <button
                          onClick={() => setCompleted((p) => ({ ...p, [rc.id]: !p[rc.id] }))}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "none", border: "none", cursor: "pointer",
                            padding: "3px 0 0", fontSize: 10,
                          }}
                        >
                          <span style={{
                            width: 13, height: 13, borderRadius: 3,
                            border: `1.5px solid ${done ? "#10b981" : "#d1d5db"}`,
                            background: done ? "#10b981" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: 8,
                          }}>
                            {done && <HiCheck style={{ width: 9, height: 9 }} />}
                          </span>
                          <span style={{ color: done ? "#10b981" : "#9ca3af" }}>完了</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 中: 工数バーグラフ */}
        <div style={{
          width: 60,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "8px 6px 6px",
        }}>
          {totalMin === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, color: "#9ca3af", textAlign: "center", lineHeight: 1.4 }}>工数<br />未入力</span>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "row", gap: 2, alignItems: "stretch", overflow: "hidden" }}>
              {/* Y軸ラベル列 - 絶対座標で境界線に配置、近接ラベルはスキップ */}
              {pjTotals.filter(x => x.totalMin > 0).length > 1 && (
                <div style={{ width: 24, flexShrink: 0, position: "relative" }}>
                  {(() => {
                    let cum = 0;
                    let lastPct = -20;
                    return pjTotals.slice(0, -1).map(({ pjId, totalMin: tMin }) => {
                      cum += tMin;
                      const pct = (cum / totalMin) * 100;
                      if (pct < 8 || pct > 92 || pct - lastPct < 18) return null;
                      lastPct = pct;
                      return (
                        <span key={pjId} style={{
                          position: "absolute",
                          top: `${pct}%`,
                          right: 0,
                          transform: "translateY(-50%)",
                          fontSize: 7,
                          color: "#9ca3af",
                          whiteSpace: "nowrap",
                          lineHeight: 1,
                          background: "white",
                          padding: "0 1px",
                        }}>
                          {shortDur(cum)}
                        </span>
                      );
                    });
                  })()}
                </div>
              )}
              {/* バー本体 */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                {pjTotals.map(({ pjId, totalMin: tMin, proj }) => (
                  <div
                    key={pjId}
                    title={`${proj.name}: ${fmtDuration(tMin)}`}
                    style={{
                      flex: tMin,
                      minHeight: tMin > 0 ? 16 : 0,
                      background: proj.color,
                      borderBottom: "1px solid rgba(255,255,255,0.6)",
                      transition: "flex 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize: 9, color: "#6b7280", textAlign: "center", flexShrink: 0, marginTop: 4, lineHeight: 1.3 }}>
            合計<br />{fmtDuration(totalMin)}
          </div>
        </div>

        {/* 右サイドバー: RepoCa追加 */}
        <div className="split-col" style={{ width: 200, flexShrink: 0 }}>

          {/* 未完了のRepoCa */}
          <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12, borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            未完了のRepoCa
          </div>
          <div style={{ flex: "0 0 auto", maxHeight: "32%", overflowY: "auto", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
            {unfinished.length === 0 ? (
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>なし</p>
            ) : (
              unfinished.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc)}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                      <span className="chip chip-indigo" style={{ fontSize: 9 }}>{proj?.icon} {proj?.name}</span>
                    </div>
                    <p style={{ fontSize: 11, margin: 0, fontWeight: 500, color: "#1f2937" }}>{rc.content}</p>
                    <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>{rc.createdAt.slice(0, 10)}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* お気に入りのRepoCa */}
          <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12, borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            お気に入りのRepoCa
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
            {favorites.length === 0 ? (
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>なし</p>
            ) : (
              favorites.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc)}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                      <span className="chip chip-yellow" style={{ fontSize: 9 }}>⭐ お気に入り</span>
                    </div>
                    <p style={{ fontSize: 11, margin: 0, fontWeight: 500, color: "#1f2937" }}>{rc.content}</p>
                    <span style={{ fontSize: 9, color: "#9ca3af" }}>{proj?.name}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* 新しいRepoCaを作成 */}
          <div style={{ padding: "8px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <Link href="/repoca/new">
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: 11, padding: "6px" }}>
                + 新しいRepoCaを作成
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* 下部ボタン */}
      <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
        <Link href="/report" style={{ flex: 1 }}>
          <button className="btn btn-ghost" style={{ width: "100%" }}>戻る</button>
        </Link>
        <button
          className="btn"
          style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
          onClick={() => setShowConfirm(true)}
        >
          提出
        </button>
      </div>
    </div>
  );
}
