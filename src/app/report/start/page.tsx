"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RepoCa, TaskLabel, ImplScope } from "@/types";
import { HiArrowLeft, HiCheck, HiX, HiStar, HiOutlineStar, HiPencil, HiTrash } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const truncate = (s: string, max = 10) => s.length > max ? s.slice(0, max) + "..." : s;

const START_DRAFT_KEY = "mitac_start_report_draft";

function loadStartDraft(): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(START_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStartDraft(ids: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(START_DRAFT_KEY, JSON.stringify(ids));
}

function clearStartDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(START_DRAFT_KEY);
}

const IMPL_SCOPES: ImplScope[] = ["フロント", "バック", "インフラ", "フルスタック", "その他"];

// page.tsx と同じ変換ロジックで出勤済みか判定
function resolveAttendance(): "idle" | "working" {
  if (typeof window === "undefined") return "idle";
  const saved = localStorage.getItem("mitac_attendance");
  if (saved === "working" || saved === "departing") return "working";
  return "idle";
}

export default function StartReport() {
  const { allRepoCas, updateRepoCa, removeRepoCa, hasStartReported, setHasStartReported, setTodayFromIds, favoriteIds, toggleFavorite, startReportedDate, setStartReportedDate, pendingRepoCaIds, clearPendingRepoCaIds, setCompletionType, incompleteIdsFromLastEnd, setIncompleteIdsFromLastEnd } = useRepoCa();
  const router = useRouter();
  const { projects } = useProjects();
  const navigatingRef = useRef(false);

  const [attendanceResolved, setAttendanceResolved] = useState<"idle" | "working">("idle");
  useEffect(() => {
    setAttendanceResolved(resolveAttendance());
  }, []);

  // 追加したRepoCa（既に選択済みのもの）- sessionStorageドラフト or 前回終業報告の未完了IDをデフォルト選択
  const [addedIds, setAddedIds] = useState<string[]>(() => {
    const draft = loadStartDraft();
    if (draft && draft.length > 0) return draft;
    return [...incompleteIdsFromLastEnd];
  });

  // addedIds をsessionStorageに即時保存
  useEffect(() => {
    saveStartDraft(addedIds);
  }, [addedIds]);

  // /repoca/new から戻ったとき・前回未完了の引き継ぎ
  useEffect(() => {
    const ids: string[] = [];
    if (incompleteIdsFromLastEnd.length > 0) {
      ids.push(...incompleteIdsFromLastEnd);
      setIncompleteIdsFromLastEnd([]);
    }
    if (pendingRepoCaIds.length > 0) {
      ids.push(...pendingRepoCaIds);
      clearPendingRepoCaIds();
    }
    if (ids.length > 0) {
      setAddedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hovered, setHovered] = useState<{ id: string; below: boolean } | null>(null);
  const [editingRepoCa, setEditingRepoCa] = useState<RepoCa | null>(null);

  // 編集フォーム用の一時state
  const [editContent, setEditContent] = useState("");
  const [editTab, setEditTab] = useState<"開発" | "その他">("開発");
  const [editLabel, setEditLabel] = useState<TaskLabel>("新規作成");
  const [editImplScope, setEditImplScope] = useState<ImplScope>("フロント");
  const [editProjectId, setEditProjectId] = useState("");

  const openEditModal = (rc: RepoCa) => {
    setEditingRepoCa(rc);
    setEditContent(rc.content);
    const tab = (rc.taskType === "開発" || rc.taskType === "実装") ? "開発" : "その他";
    setEditTab(tab);
    setEditLabel(rc.label);
    setEditImplScope(rc.implScope);
    setEditProjectId(rc.projectId);
  };

  const saveEdit = () => {
    if (!editingRepoCa) return;
    updateRepoCa(editingRepoCa.id, {
      content: editContent,
      taskType: editTab === "開発" ? "開発" : "その他",
      label: editLabel,
      implScope: editImplScope,
      projectId: editProjectId,
    });
    setEditingRepoCa(null);
  };

  // 未完了RepoCa（addedに含まれないもの）
  const unfinished = allRepoCas.filter((r) => !r.isCompleted && !addedIds.includes(r.id));
  // お気に入りRepoCa（contextのfavoriteIdsベース、addedに含まれないもの）
  const favorites  = allRepoCas.filter((r) => favoriteIds.includes(r.id) && !addedIds.includes(r.id));

  const addToList   = (id: string) => setAddedIds((prev) => [...prev, id]);
  const removeFromList = (id: string) => setAddedIds((prev) => prev.filter((x) => x !== id));

  // PJでグループ化
  const groupByPj = (ids: string[]) => {
    const map = new Map<string, RepoCa[]>();
    ids.forEach((id) => {
      const rc = allRepoCas.find((r) => r.id === id);
      if (!rc) return;
      const arr = map.get(rc.projectId) ?? [];
      arr.push(rc);
      map.set(rc.projectId, arr);
    });
    return map;
  };

  const grouped = groupByPj(addedIds);

  const todayStr = new Date().toDateString();
  const isStartReportedToday = startReportedDate === todayStr;

  const blockInfo = navigatingRef.current ? null : attendanceResolved === "idle"
    ? { icon: "🏠", title: "まず出勤してください", desc: "出勤ボタンを押してから始業報告を行ってください。", href: "/", btnLabel: "ホームに戻る" }
    : (hasStartReported || isStartReportedToday)
    ? { icon: "🌅", title: "提出完了。お疲れ様でした！", desc: "本日の始業報告は完了しています。", href: "/", btnLabel: "ホームに戻る" }
    : null;

  /* ── メイン ── */
  return (
    <div className="page-root">
      {blockInfo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: "32px 28px", width: 340, maxWidth: "88vw", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.22)" }}>
            <div style={{ fontSize: 48 }}>{blockInfo.icon}</div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>{blockInfo.title}</p>
            <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>{blockInfo.desc}</p>
            <Link href={blockInfo.href} style={{ display: "inline-block" }}>
              <button className="btn btn-primary" style={{ marginTop: 8 }}>{blockInfo.btnLabel}</button>
            </Link>
          </div>
        </div>
      )}
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/report" style={{ color: "#007aff", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>始業報告</span>
      </div>

      {/* レイアウト: メイン + 右サイドバー */}
      <div className="page-body report-layout">

        {/* メイン: 追加したRepoCa一覧 */}
        <div className="split-col">
          <div className="split-col-header">
            <span>追加したRepoCa一覧</span>
            <span className="chip chip-indigo">{addedIds.length}枚</span>
          </div>
          <div className="split-col-body">
            {addedIds.length === 0 ? (
              <div className="repoca-card slot-empty" style={{ height: 80 }}>
                右のRepoCaを選択して追加してください
              </div>
            ) : (
              Array.from(grouped.entries()).map(([projId, cards]) => {
                const proj = projects.find((p) => p.id === projId);
                return (
                  <div key={projId} className="pj-group" style={{ background: proj?.color ?? "#f3f4f6" }}>
                    <div className="pj-group-header" style={{ color: proj?.textColor ?? "#374151" }}>
                      <span>{proj?.icon}</span>
                      <span>{proj?.name ?? "その他"}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {cards.map((rc) => (
                        <div
                          key={rc.id}
                          className="repoca-mini selected"
                          style={{ position: "relative" }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHovered({ id: rc.id, below: rect.top < 200 });
                          }}
                          onMouseLeave={() => setHovered(null)}
                        >
                          {/* ホバー詳細ツールチップ */}
                          {hovered?.id === rc.id && (
                            <div style={{
                              position: "absolute",
                              ...(hovered.below
                                ? { top: "calc(100% + 6px)" }
                                : { bottom: "calc(100% + 6px)" }),
                              left: 0,
                              width: 300,
                              background: "#1a1a2e",
                              color: "white",
                              borderRadius: 10,
                              padding: "10px 12px",
                              zIndex: 50,
                              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                              pointerEvents: "none",
                            }}>
                              <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>{truncate(rc.content)}</p>
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
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                            <span style={{ fontSize: 14, color: proj?.textColor ?? "#374151", fontWeight: 700 }}>
                              {rc.taskType}
                            </span>
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              <button
                                onClick={() => openEditModal(rc)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0, display: "flex", alignItems: "center" }}
                                title="編集"
                              >
                                <HiPencil style={{ width: 11, height: 11 }} />
                              </button>
                              <button
                                onClick={() => removeFromList(rc.id)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
                              >
                                <HiX style={{ width: 12, height: 12 }} />
                              </button>
                            </div>
                          </div>
                          <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: "#1f2937", lineHeight: 1.3 }}>
                            {truncate(rc.content)}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                            <button
                              onClick={() => toggleFavorite(rc.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                            >
                              {favoriteIds.includes(rc.id)
                                ? <HiStar style={{ width: 11, height: 11, color: "#d97706" }} />
                                : <HiOutlineStar style={{ width: 11, height: 11, color: "#d1d5db" }} />}
                            </button>
                            <span style={{ fontSize: 14, color: "#9ca3af" }}>{rc.createdAt.slice(0, 10)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右サイドバー: 未完了 + お気に入り */}
        <div className="split-col">
          {/* 未完了のRepoCa */}
          <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 14, borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            未完了のRepoCa
          </div>
          <div style={{ flex: "0 0 auto", maxHeight: "40%", overflowY: "auto", scrollbarGutter: "stable", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
            {unfinished.length === 0 ? (
              <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>なし</p>
            ) : (
              unfinished.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      {rc.taskType === "その他"
                        ? <span className="chip" style={{ fontSize: 14, background: "#f3f4f6", color: "#374151" }}>その他</span>
                        : <span className="chip chip-indigo" style={{ fontSize: 14 }}>{proj?.icon} {proj?.name}</span>
                      }
                      <button onClick={(e) => { e.stopPropagation(); removeRepoCa(rc.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <HiTrash style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: "#1f2937" }}>{truncate(rc.content)}</p>
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
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                      <span className="chip chip-yellow" style={{ fontSize: 14 }}>⭐ お気に入り</span>
                      <button onClick={(e) => { e.stopPropagation(); removeRepoCa(rc.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444", display: "flex", alignItems: "center", flexShrink: 0 }}>
                        <HiTrash style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                    <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: "#1f2937" }}>{truncate(rc.content)}</p>
                    <span style={{ fontSize: 14, color: "#9ca3af" }}>{rc.taskType === "その他" ? "その他" : proj?.name}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* 新しいRepoCaを作成 */}
          <div style={{ padding: "8px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <Link href="/repoca/new?from=/report/start">
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
          className="btn btn-primary"
          style={{ flex: 2 }}
          disabled={addedIds.length === 0}
          onClick={() => setShowConfirmModal(true)}
        >
          提出（{addedIds.length}枚）
        </button>
      </div>

      {/* 確認モーダル */}
      {showConfirmModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: "60vw", maxWidth: "60vw", maxHeight: "60vh", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "#007aff", padding: "16px 20px" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0 }}>始業報告の確認</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
                選択済みRepoCa: <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{addedIds.length}枚</span>
              </div>
              {addedIds.map((id) => {
                const rc = allRepoCas.find((r) => r.id === id);
                const proj = projects.find((p) => p.id === rc?.projectId);
                if (!rc) return null;
                return (
                  <div key={id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <HiCheck style={{ width: 14, height: 14, color: "#007aff", flexShrink: 0 }} />
                    {rc.taskType === "その他"
                      ? <span className="chip" style={{ fontSize: 14, background: "#f3f4f6", color: "#374151" }}>その他</span>
                      : <span className="chip chip-indigo" style={{ fontSize: 14 }}>{proj?.name}</span>
                    }
                    <span style={{ fontSize: 14, color: "#374151" }}>{truncate(rc.content)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>戻る</button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={() => { navigatingRef.current = true; setTodayFromIds(addedIds); setHasStartReported(true); setStartReportedDate(new Date().toDateString()); clearStartDraft(); setShowConfirmModal(false); setCompletionType('start'); router.push('/'); }}>
                送信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RepoCa編集モーダル */}
      {editingRepoCa && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setEditingRepoCa(null)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 400, maxWidth: "92vw", maxHeight: "85vh", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "#007aff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: "white", margin: 0 }}>RepoCaを編集</p>
              {/* タブ */}
              <div style={{ display: "flex", gap: 4 }}>
                {(["開発", "その他"] as const).map((t) => (
                  <button key={t} onClick={() => {
                    setEditTab(t);
                    setEditLabel(t === "開発" ? "新規作成" : "調査");
                  }}
                    style={{
                      padding: "3px 10px", borderRadius: 99, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                      background: editTab === t ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                      color: editTab === t ? "#003878" : "rgba(255,255,255,0.8)",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* プロジェクト（開発タブのみ） */}
              {editTab === "開発" && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>プロジェクト</label>
                  <select
                    value={editProjectId}
                    onChange={(e) => setEditProjectId(e.target.value)}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14 }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* ラベル */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>ラベル</label>
                <select
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value as TaskLabel)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14 }}
                >
                  {(editTab === "開発"
                    ? ["新規作成", "修正", "調査", "レビュー", "その他"]
                    : ["調査", "MTG", "外部対応", "その他"]
                  ).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* 実装範囲（開発タブのみ） */}
              {editTab === "開発" && (
                <div>
                  <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>実装範囲</label>
                  <select
                    value={editImplScope}
                    onChange={(e) => setEditImplScope(e.target.value as ImplScope)}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14 }}
                  >
                    {IMPL_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* 内容 */}
              <div>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>タスク内容</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14, resize: "none" }}
                />
                <div style={{ textAlign: "right", fontSize: 12, color: "#9ca3af" }}>{editContent.length}文字</div>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingRepoCa(null)}>キャンセル</button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                disabled={!editContent.trim()}
                onClick={saveEdit}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
