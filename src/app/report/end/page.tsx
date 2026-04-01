"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepoCa, TaskLabel, ImplScope } from "@/types";
import { HiArrowLeft, HiCheck, HiTrash, HiPencilAlt } from "react-icons/hi";
import { fmtDuration, DURATION_OPTIONS } from "@/lib/utils";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const DRAFT_KEY = "mitac_end_report_draft";

interface EndReportDraft {
  selectedIds: string[];
  durations: Record<string, number>;
  completed: Record<string, boolean>;
  manuallyAddedIds: string[];
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

function saveDraft(selectedIds: string[], durations: Record<string, number>, completed: Record<string, boolean>, manuallyAddedIds: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedIds, durations, completed, manuallyAddedIds }));
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
  const { allRepoCas, todayRepoCas, addTodayRepoCa, toggleTodayRepoCa, hasStartReported, hasOvertimeReported, setHasEndReported, resetDailyReports, endReportedDate, setEndReportedDate, favoriteIds, toggleFavorite, bulkUpdateCompleted, pendingRepoCaIds, clearPendingRepoCaIds, removeRepoCa, updateRepoCa, setCompletionType, setIncompleteIdsFromLastEnd } = useRepoCa();
  const router = useRouter();
  const { projects } = useProjects();
  const navigatingRef = useRef(false);

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
  const [editingRepoCa, setEditingRepoCa] = useState<RepoCa | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<RepoCa>>({});
  const [editTab, setEditTab] = useState<"開発" | "その他">("開発");

  const openEdit = (rc: RepoCa) => {
    setEditingRepoCa(rc);
    setEditDraft({ projectId: rc.projectId, taskType: rc.taskType, label: rc.label, implScope: rc.implScope, content: rc.content, isFavorite: rc.isFavorite });
    setEditTab(rc.taskType === "開発" || rc.taskType === "実装" ? "開発" : "その他");
  };

  const saveEdit = () => {
    if (!editingRepoCa) return;
    const patch: Partial<RepoCa> = {
      ...editDraft,
      xp: (editDraft.taskType === "開発" || editDraft.taskType === "実装") ? 50 : 20,
    };
    updateRepoCa(editingRepoCa.id, patch);
    setSelectedRepoCas((prev) => prev.map((r) => r.id === editingRepoCa.id ? { ...r, ...patch } : r));
    setEditingRepoCa(null);
  };

  const [manuallyAddedIds, setManuallyAddedIds] = useState<Set<string>>(() => {
    const draft = loadDraft();
    return new Set(draft?.manuallyAddedIds ?? []);
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hovered, setHovered] = useState<{ id: string; below: boolean } | null>(null);

  // 状態変化をsessionStorageに即時保存
  useEffect(() => {
    saveDraft(selectedRepoCas.map((r) => r.id), durations, completed, Array.from(manuallyAddedIds));
  }, [selectedRepoCas, durations, completed, manuallyAddedIds]);

  // /repoca/new から戻ったとき、新規作成RepoCaを自動追加
  useEffect(() => {
    if (pendingRepoCaIds.length > 0) {
      const newRcs = allRepoCas.filter((r) => pendingRepoCaIds.includes(r.id));
      setSelectedRepoCas((prev) => [...prev, ...newRcs.filter((r) => !prev.find((p) => p.id === r.id))]);
      setDurations((prev) => ({ ...prev, ...Object.fromEntries(newRcs.map((r) => [r.id, 0])) }));
      setCompleted((prev) => ({ ...prev, ...Object.fromEntries(newRcs.map((r) => [r.id, false])) }));
      setManuallyAddedIds((prev) => { const s = new Set(prev); newRcs.forEach((r) => s.add(r.id)); return s; });
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
    setManuallyAddedIds((prev) => { const s = new Set(prev); s.add(rc.id); return s; });
    addTodayRepoCa(rc);
  };

  const removeFromList = (id: string) => {
    setSelectedRepoCas((prev) => prev.filter((r) => r.id !== id));
    setManuallyAddedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
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

  const todayStr = new Date().toDateString();
  const isEndReportedToday = endReportedDate === todayStr;

  const blockInfo = navigatingRef.current ? null : (!hasStartReported && isEndReportedToday)
    ? { icon: "🎉", title: "提出完了。お疲れ様でした！", desc: "本日の全報告が完了しています。", href: "/", btnLabel: "ホームに戻る" }
    : (!hasStartReported && endReportedDate && endReportedDate !== todayStr)
    ? { icon: "📋", title: "始業報告を行ってください", desc: "新しい日が始まりました。まずは始業報告を提出しましょう。", href: "/report/start", btnLabel: "始業報告する" }
    : !hasStartReported
    ? { icon: "⚠️", title: "始業報告が提出されていません", desc: "終業報告は始業報告を提出した後に行うことができます", href: "/report/start", btnLabel: "始業報告する" }
    : !hasOvertimeReported
    ? { icon: "⚠️", title: "残業報告が提出されていません", desc: "終業報告は残業報告を提出した後に行うことができます", href: "/report/overtime", btnLabel: "残業報告する" }
    : null;

  /* ── メイン ── */
  return (
    <div className="page-root">
      {blockInfo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: "40px 36px", width: "60vw", maxWidth: "60vw", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.22)" }}>
            <div style={{ fontSize: 48 }}>{blockInfo.icon}</div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>{blockInfo.title}</p>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>{blockInfo.desc}</p>
            <Link href={blockInfo.href} style={{ display: "inline-block" }}>
              <button className="btn btn-primary" style={{ marginTop: 8 }}>{blockInfo.btnLabel}</button>
            </Link>
          </div>
        </div>
      )}
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
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {manuallyAddedIds.has(rc.id) ? (
                              <button
                                onClick={() => removeFromList(rc.id)}
                                title="リストから外す"
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9ca3af", fontSize: 16, lineHeight: 1, display: "flex", alignItems: "center" }}
                              >
                                ×
                              </button>
                            ) : (
                              <span title="始業報告で追加" style={{ fontSize: 10, color: "#60a5fa", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 3, padding: "1px 3px", lineHeight: 1.3, fontWeight: 700 }}>
                                始
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateRepoCa(rc.id, { isFavorite: !rc.isFavorite });
                                toggleFavorite(rc.id);
                                setSelectedRepoCas((prev) => prev.map((r) => r.id === rc.id ? { ...r, isFavorite: !r.isFavorite } : r));
                              }}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, padding: 0, color: rc.isFavorite ? "#f59e0b" : "#e5e7eb" }}
                            >
                              ★
                            </button>
                          </div>
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
                        {(() => {
                          const dur = durations[rc.id] ?? 0;
                          const disabled = dur === 0;
                          return (
                            <button
                              onClick={() => { if (disabled) return; setCompleted((p) => ({ ...p, [rc.id]: !p[rc.id] })); toggleTodayRepoCa(rc.id); }}
                              disabled={disabled}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                background: "none", border: "none",
                                cursor: disabled ? "not-allowed" : "pointer",
                                padding: "3px 0 0", fontSize: 14,
                                opacity: disabled ? 0.4 : 1,
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
                              <span style={{ color: done ? "#10b981" : disabled ? "#9ca3af" : "#1f2937" }}>完了</span>
                            </button>
                          );
                        })()}
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
                    return pjTotals.slice(0, -1).map(({ pjId, totalMin: tMin }) => {
                      cum += tMin;
                      const pct = (cum / totalMin) * 100;
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
                      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(rc); }}
                          disabled={rc.isCompleted}
                          style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", cursor: rc.isCompleted ? "not-allowed" : "pointer", color: rc.isCompleted ? "#d1d5db" : "#6b7280" }}>
                          <HiPencilAlt style={{ width: 14, height: 14 }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeRepoCa(rc.id); }}
                          disabled={rc.isCompleted}
                          style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", cursor: rc.isCompleted ? "not-allowed" : "pointer", color: rc.isCompleted ? "#d1d5db" : "#ef4444" }}>
                          <HiTrash style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
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
                      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <button onClick={(e) => { e.stopPropagation(); openEdit(rc); }}
                          disabled={rc.isCompleted}
                          style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", cursor: rc.isCompleted ? "not-allowed" : "pointer", color: rc.isCompleted ? "#d1d5db" : "#6b7280" }}>
                          <HiPencilAlt style={{ width: 14, height: 14 }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); removeRepoCa(rc.id); }}
                          disabled={rc.isCompleted}
                          style={{ background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", cursor: rc.isCompleted ? "not-allowed" : "pointer", color: rc.isCompleted ? "#d1d5db" : "#ef4444" }}>
                          <HiTrash style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
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
          disabled={totalMin === 0}
          style={{ flex: 2, background: totalMin === 0 ? "#d1d5db" : "#007aff", color: totalMin === 0 ? "#9ca3af" : "white", cursor: totalMin === 0 ? "not-allowed" : "pointer" }}
          onClick={() => setShowConfirmModal(true)}
        >
          提出
        </button>
      </div>

      {/* 編集モーダル */}
      {editingRepoCa && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setEditingRepoCa(null)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 360, maxWidth: "92vw", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "#007aff", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>RepoCaを編集</p>
              <button onClick={() => setEditingRepoCa(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* お気に入り */}
              <button onClick={() => setEditDraft((d) => ({ ...d, isFavorite: !d.isFavorite }))}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 14, padding: 0 }}>
                <span style={{ fontSize: 16, color: editDraft.isFavorite ? "#f59e0b" : "#d1d5db" }}>{editDraft.isFavorite ? "★" : "☆"}</span>
                <span style={{ color: editDraft.isFavorite ? "#d97706" : "#9ca3af", fontWeight: 600 }}>お気に入り</span>
              </button>
              {/* PJ名 */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>PJ名 <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={editDraft.projectId ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, projectId: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, color: "#374151" }}>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                </select>
              </div>
              {/* ラベル */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>ラベル <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={editDraft.label ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, label: e.target.value as TaskLabel }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, color: "#374151" }}>
                  {(editTab === "開発"
                    ? ["新規作成", "修正", "調査", "レビュー", "その他"]
                    : ["調査", "MTG", "外部対応", "その他"]
                  ).map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              {/* 実装範囲（開発タブのみ） */}
              {editTab === "開発" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>実装範囲 <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={editDraft.implScope ?? ""} onChange={(e) => setEditDraft((d) => ({ ...d, implScope: e.target.value as ImplScope }))}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, color: "#374151" }}>
                    {(["フロント", "バック", "インフラ", "フルスタック", "その他"] as ImplScope[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* タスク内容 */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>タスク内容 <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea
                  value={editDraft.content ?? ""}
                  onChange={(e) => setEditDraft((d) => ({ ...d, content: e.target.value }))}
                  rows={3}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, resize: "none", color: "#374151", boxSizing: "border-box" }}
                />
                <div style={{ textAlign: "right", fontSize: 12, color: "#9ca3af" }}>{(editDraft.content ?? "").length}文字</div>
              </div>
            </div>
            <div style={{ padding: "10px 18px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingRepoCa(null)}>キャンセル</button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                disabled={!editDraft.projectId || !editDraft.label || !editDraft.content?.trim() || (editTab === "開発" && !editDraft.implScope)}
                onClick={saveEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 確認モーダル */}
      {showConfirmModal && (() => {
        const completedCount = Object.values(completed).filter(Boolean).length;
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowConfirmModal(false)}
          >
            <div
              style={{ background: "white", borderRadius: 16, width: "60vw", maxWidth: "60vw", maxHeight: "80vh", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "#007aff", padding: "16px 20px" }}>
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
                {Array.from(
                  selectedRepoCas.reduce((map, rc) => {
                    const arr = map.get(rc.projectId) ?? [];
                    arr.push(rc);
                    map.set(rc.projectId, arr);
                    return map;
                  }, new Map<string, typeof selectedRepoCas>())
                ).map(([projectId, rcs]) => {
                  const proj = projects.find((p) => p.id === projectId);
                  return (
                    <div key={projectId} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0 4px", borderBottom: "1px solid #e5e7eb" }}>
                        <span className="chip" style={{ fontSize: 13, background: proj?.color, color: proj?.textColor }}>{proj?.name}</span>
                      </div>
                      {rcs.map((rc) => {
                        const done = completed[rc.id] ?? false;
                        const dur = durations[rc.id] ?? 0;
                        return (
                          <div key={rc.id} style={{ display: "flex", gap: 6, alignItems: "center", padding: "5px 0 5px 10px", borderBottom: "1px solid #f9fafb" }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0, background: done ? "#10b981" : "#d1d5db" }} />
                            <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>{rc.content}</span>
                            <span style={{ fontSize: 14, color: dur > 0 ? "#1f2937" : "#ef4444", fontWeight: 600, flexShrink: 0 }}>{fmtDuration(dur)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>戻る</button>
                <button className="btn" style={{ flex: 2, background: "#007aff", color: "white" }}
                  onClick={() => {
                    navigatingRef.current = true;
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
