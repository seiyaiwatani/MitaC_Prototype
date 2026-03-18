"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepoCa } from "@/types";
import { HiArrowLeft, HiCheck, HiTrash } from "react-icons/hi";
import { fmtDuration, DURATION_OPTIONS } from "@/lib/utils";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const DRAFT_KEY = "mitac_end_report_draft";

interface EndReportDraft {
  selectedIds: string[];
  durations: Record<string, number>;
  completed: Record<string, boolean>;
}

function loadDraft(): EndReportDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(selectedIds: string[], durations: Record<string, number>, completed: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedIds, durations, completed }));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}

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
  const { allRepoCas, todayRepoCas, addTodayRepoCa, toggleTodayRepoCa, hasStartReported, hasOvertimeReported, setHasEndReported, resetDailyReports, endReportedDate, setEndReportedDate, favoriteIds, bulkUpdateCompleted, pendingRepoCaIds, clearPendingRepoCaIds, removeRepoCa, setCompletionType, setIncompleteIdsFromLastEnd } = useRepoCa();
  const router = useRouter();
  const { projects } = useProjects();

  const [selectedRepoCas, setSelectedRepoCas] = useState<RepoCa[]>(() => {
    const draft = loadDraft();
    if (draft?.selectedIds?.length) {
      const rcs = allRepoCas.filter((r) => draft.selectedIds.includes(r.id));
      if (rcs.length > 0) return rcs;
    }
    return [...todayRepoCas];
  });
  const [durations, setDurations] = useState<Record<string, number>>(() => {
    const draft = loadDraft();
    if (draft?.durations) return draft.durations;
    return Object.fromEntries(todayRepoCas.map((rc) => [rc.id, 0]));
  });
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const draft = loadDraft();
    if (draft?.completed) return draft.completed;
    return Object.fromEntries(todayRepoCas.map((rc) => [rc.id, rc.isCompleted]));
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hovered, setHovered] = useState<{ id: string; below: boolean } | null>(null);

  // 状態変化をsessionStorageに即時保存
  useEffect(() => {
    saveDraft(selectedRepoCas.map((r) => r.id), durations, completed);
  }, [selectedRepoCas, durations, completed]);

  // /repoca/new から戻ったとき、新規作成RepoCaを自動追加
  useEffect(() => {
    if (pendingRepoCaIds.length > 0) {
      const newRcs = allRepoCas.filter((r) => pendingRepoCaIds.includes(r.id));
      setSelectedRepoCas((prev) => [...prev, ...newRcs.filter((r) => !prev.find((p) => p.id === r.id))]);
      setDurations((prev) => ({ ...prev, ...Object.fromEntries(newRcs.map((r) => [r.id, 0])) }));
      setCompleted((prev) => ({ ...prev, ...Object.fromEntries(newRcs.map((r) => [r.id, false])) }));
      clearPendingRepoCaIds();
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const totalMin = selectedRepoCas.reduce((s, rc) => s + (durations[rc.id] ?? 0), 0);

  // サイドバー用
  const unfinished = allRepoCas.filter((r) => !r.isCompleted && !selectedRepoCas.find((s) => s.id === r.id));
  const favorites  = allRepoCas.filter((r) => favoriteIds.includes(r.id) && !selectedRepoCas.find((s) => s.id === r.id));

  const addToList = (rc: RepoCa) => {
    setSelectedRepoCas((prev) => [...prev, rc]);
    setDurations((prev) => ({ ...prev, [rc.id]: 0 }));
    addTodayRepoCa(rc);
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

  /* ── 終業報告済み: 日付によって表示を切り替え ── */
  const todayStr = new Date().toDateString();
  const isEndReportedToday = endReportedDate === todayStr;

  // 同日中に終業報告ページを再訪した場合 → 完了メッセージ
  if (!hasStartReported && isEndReportedToday) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>終業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            提出完了。お疲れ様でした！
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.8 }}>
            本日の全報告が完了しています。
          </p>
          <Link href="/">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>ホームに戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  // 日付が変わった後に終業報告ページを訪れた場合 → 始業報告を促す
  if (!hasStartReported && endReportedDate && endReportedDate !== todayStr) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>終業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            始業報告を行ってください
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            新しい日が始まりました。<br />まずは始業報告を提出しましょう。
          </p>
          <Link href="/report/start">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>始業報告する</button>
          </Link>
        </div>
      </div>
    );
  }

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
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
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
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            終業報告は残業報告を提出した後に<br />行うことができます
          </p>
          <Link href="/report/overtime">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>残業報告する</button>
          </Link>
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
        <span style={{ marginLeft: "auto", fontSize: 14, color: "#6b7280" }}>
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
                            <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>{rc.content}</p>
                            {[
                              { label: "種別",   value: rc.taskType },
                              { label: "ラベル", value: rc.label },
                              { label: "範囲",   value: rc.implScope },
                              { label: "XP",     value: `+${rc.xp} XP` },
                              { label: "作成",   value: new Date(rc.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }) },
                            ].map(({ label, value }) => (
                              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 3 }}>
                                <span style={{ color: "#9ca3af" }}>{label}</span>
                                <span style={{ fontWeight: 600 }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <span className="chip" style={{ fontSize: 14, background: proj.color, color: proj.textColor }}>{rc.taskType}</span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0, color: rc.isFavorite ? "#f59e0b" : "#e5e7eb" }}>
                            ★
                          </button>
                        </div>
                        <p style={{ fontSize: 14, margin: "0 0 6px", fontWeight: 500, color: dur === 0 ? "#ef4444" : "#1f2937", lineHeight: 1.3 }}>
                          {rc.content}
                        </p>
                        {/* 工数セレクト */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <select
                            value={dur}
                            onChange={(e) => setDurations((p) => ({ ...p, [rc.id]: Number(e.target.value) }))}
                            style={{
                              flex: 1, fontSize: 14, border: "1px solid #e5e7eb",
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
                          onClick={() => { setCompleted((p) => ({ ...p, [rc.id]: !p[rc.id] })); toggleTodayRepoCa(rc.id); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            background: "none", border: "none", cursor: "pointer",
                            padding: "3px 0 0", fontSize: 14,
                          }}
                        >
                          <span style={{
                            width: 13, height: 13, borderRadius: 3,
                            border: `1.5px solid ${done ? "#10b981" : "#d1d5db"}`,
                            background: done ? "#10b981" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: 14,
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
          width: 80,
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
              <span style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", lineHeight: 1.4 }}>工数<br />未入力</span>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "row", gap: 2, alignItems: "stretch", overflow: "hidden" }}>
              {/* Y軸ラベル列 - 絶対座標で境界線に配置、近接ラベルはスキップ */}
              {pjTotals.filter(x => x.totalMin > 0).length > 1 && (
                <div style={{ flexShrink: 0, position: "relative", minWidth: 28 }}>
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
                          left: 0,
                          transform: "translateY(-50%)",
                          fontSize: 10,
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
          <div style={{ fontSize: 14, color: "#6b7280", textAlign: "center", flexShrink: 0, marginTop: 4, lineHeight: 1.3 }}>
            合計<br />{fmtDuration(totalMin)}
          </div>
        </div>

        {/* 右サイドバー: RepoCa追加 */}
        <div className="split-col" style={{ width: 300, flexShrink: 0 }}>

          {/* 未完了のRepoCa */}
          <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 14, borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            未完了のRepoCa
          </div>
          <div style={{ flex: "0 0 auto", maxHeight: "32%", overflowY: "auto", scrollbarGutter: "stable", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
            {unfinished.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>なし</p>
            ) : (
              unfinished.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      <span className="chip chip-indigo" style={{ fontSize: 14 }}>{proj?.icon} {proj?.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); removeRepoCa(rc.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <HiTrash style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: "#1f2937" }}>{rc.content}</p>
                    <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 2 }}>{rc.createdAt.slice(0, 10)}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* お気に入りのRepoCa */}
          <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 14, borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            お気に入りのRepoCa
          </div>
          <div style={{ flex: 1, overflowY: "auto", scrollbarGutter: "stable", padding: "6px 8px" }}>
            {favorites.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>なし</p>
            ) : (
              favorites.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      <span className="chip chip-yellow" style={{ fontSize: 14 }}>⭐ お気に入り</span>
                      <button onClick={(e) => { e.stopPropagation(); removeRepoCa(rc.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <HiTrash style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: "#1f2937" }}>{rc.content}</p>
                    <span style={{ fontSize: 14, color: "#9ca3af" }}>{proj?.name}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* 新しいRepoCaを作成 */}
          <div style={{ padding: "8px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <Link href="/repoca/new?from=/report/end">
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: 14, padding: "6px" }}>
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
          onClick={() => setShowConfirmModal(true)}
        >
          提出
        </button>
      </div>

      {/* 確認モーダル */}
      {showConfirmModal && (() => {
        const completedCount = Object.values(completed).filter(Boolean).length;
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowConfirmModal(false)}
          >
            <div
              style={{ background: "white", borderRadius: 16, width: 380, maxWidth: "92vw", maxHeight: "80vh", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", padding: "16px 20px" }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>終業報告の確認</p>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
                {[
                  { label: "完了タスク", value: `${completedCount}/${selectedRepoCas.length}` },
                  { label: "総工数", value: fmtDuration(totalMin) },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14 }}>
                    <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ color: "#1f2937", fontWeight: 700 }}>{r.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>RepoCa一覧</div>
                {selectedRepoCas.map((rc) => {
                  const proj = projects.find((p) => p.id === rc.projectId);
                  const done = completed[rc.id] ?? false;
                  const dur = durations[rc.id] ?? 0;
                  return (
                    <div key={rc.id} style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f9fafb" }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                        background: done ? "#10b981" : "#d1d5db",
                      }} />
                      <span className="chip" style={{ fontSize: 14, background: proj?.color, color: proj?.textColor }}>{proj?.name}</span>
                      <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{rc.content}</span>
                      <span style={{ fontSize: 14, color: dur > 0 ? "#1f2937" : "#ef4444", fontWeight: 600, flexShrink: 0 }}>{fmtDuration(dur)}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>戻る</button>
                <button className="btn" style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
                  onClick={() => {
                    // 完了状態を allRepoCas に一括同期
                    bulkUpdateCompleted(completed);
                    // 未完了のIDを次回始業報告のデフォルト選択として保存
                    const incompleteIds = selectedRepoCas.filter((rc) => !completed[rc.id]).map((rc) => rc.id);
                    setIncompleteIdsFromLastEnd(incompleteIds);
                    setEndReportedDate(new Date().toDateString());
                    resetDailyReports();
                    setHasEndReported(true);
                    clearDraft();
                    setCompletionType('end');
                    setShowConfirmModal(false);
                    router.push('/');
                  }}>
                  送信
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
