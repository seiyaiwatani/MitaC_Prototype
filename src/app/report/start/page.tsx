"use client";

import { useState } from "react";
import Link from "next/link";
import { RepoCa, TaskType, TaskLabel, ImplScope } from "@/types";
import { HiArrowLeft, HiCheck, HiX, HiStar, HiOutlineStar, HiPencil } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const truncate = (s: string, max = 10) => s.length > max ? s.slice(0, max) + "..." : s;

const TASK_TYPES: TaskType[] = ["開発", "実装", "MTG", "デイリースクラム", "その他"];
const TASK_LABELS: TaskLabel[] = ["新規作成", "修正", "調査", "レビュー", "その他"];
const IMPL_SCOPES: ImplScope[] = ["フロント", "バック", "インフラ", "フルスタック", "その他"];

export default function StartReport() {
  const { allRepoCas, updateRepoCa, hasStartReported, setHasStartReported, setTodayFromIds, favoriteIds, toggleFavorite, startReportedDate, setStartReportedDate } = useRepoCa();
  const { projects } = useProjects();
  // 追加したRepoCa（既に選択済みのもの）
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [hovered, setHovered] = useState<{ id: string; below: boolean } | null>(null);
  const [editingRepoCa, setEditingRepoCa] = useState<RepoCa | null>(null);

  // 編集フォーム用の一時state
  const [editContent, setEditContent] = useState("");
  const [editTaskType, setEditTaskType] = useState<TaskType>("開発");
  const [editLabel, setEditLabel] = useState<TaskLabel>("新規作成");
  const [editImplScope, setEditImplScope] = useState<ImplScope>("フロント");
  const [editProjectId, setEditProjectId] = useState("");

  const openEditModal = (rc: RepoCa) => {
    setEditingRepoCa(rc);
    setEditContent(rc.content);
    setEditTaskType(rc.taskType);
    setEditLabel(rc.label);
    setEditImplScope(rc.implScope);
    setEditProjectId(rc.projectId);
  };

  const saveEdit = () => {
    if (!editingRepoCa) return;
    updateRepoCa(editingRepoCa.id, {
      content: editContent,
      taskType: editTaskType,
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

  /* ── 提出済み: 日付によって表示を切り替え ── */
  const todayStr = new Date().toDateString();
  const isStartReportedToday = startReportedDate === todayStr;

  // 同日中に始業報告ページを再訪した場合 → 完了メッセージ
  if (!showCompleted && (hasStartReported || isStartReportedToday)) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#4f46e5", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>始業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🌅</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            提出完了。お疲れ様でした！
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.8 }}>
            本日の始業報告は完了しています。
          </p>
          <Link href="/">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>ホームに戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── 完了画面（送信直後） ── */
  if (showCompleted) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>始業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🌅</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            提出完了。お疲れ様でした！
          </p>
          <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.8 }}>
            今日も一日頑張りましょう！<br />
            選択中のRepoCa: {addedIds.length}枚
          </p>
          <div style={{ marginTop: 12, padding: "14px 20px", borderRadius: 12, background: "#ede9fe", border: "2px solid #4f46e5", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#4c1d95", margin: 0, fontWeight: 600 }}>
              ✅ 始業報告が提出されました
            </p>
          </div>
          <Link href="/">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>ホームに戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── メイン: 追加済みRepoCa一覧 + 右サイドバー ── */
  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/report" style={{ color: "#4f46e5", textDecoration: "none", display: "flex", alignItems: "center" }}>
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
                      <span>{proj?.name}</span>
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
                              width: 200,
                              background: "#1a1a2e",
                              color: "white",
                              borderRadius: 10,
                              padding: "10px 12px",
                              zIndex: 50,
                              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                              pointerEvents: "none",
                            }}>
                              <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>{truncate(rc.content)}</p>
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
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                            <span style={{ fontSize: 9, color: proj?.textColor ?? "#374151", fontWeight: 700 }}>
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
                          <p style={{ fontSize: 11, margin: 0, fontWeight: 500, color: "#1f2937", lineHeight: 1.3 }}>
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
                            <span style={{ fontSize: 9, color: "#9ca3af" }}>{rc.createdAt.slice(0, 10)}</span>
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
          <div style={{ padding: "8px 12px", fontWeight: 700, fontSize: 12, borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            未完了のRepoCa
          </div>
          <div style={{ flex: "0 0 auto", maxHeight: "40%", overflowY: "auto", padding: "6px 8px", borderBottom: "1px solid #e5e7eb" }}>
            {unfinished.length === 0 ? (
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>なし</p>
            ) : (
              unfinished.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc.id)}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                      <span className="chip chip-indigo" style={{ fontSize: 9 }}>{proj?.icon} {proj?.name}</span>
                    </div>
                    <p style={{ fontSize: 11, margin: 0, fontWeight: 500, color: "#1f2937" }}>{truncate(rc.content)}</p>
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
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc.id)}>
                    <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                      <span className="chip chip-yellow" style={{ fontSize: 9 }}>⭐ お気に入り</span>
                    </div>
                    <p style={{ fontSize: 11, margin: 0, fontWeight: 500, color: "#1f2937" }}>{truncate(rc.content)}</p>
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
            style={{ background: "white", borderRadius: 16, width: 360, maxWidth: "92vw", maxHeight: "80vh", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "16px 20px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>始業報告の確認</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                選択済みRepoCa: <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{addedIds.length}枚</span>
              </div>
              {addedIds.map((id) => {
                const rc = allRepoCas.find((r) => r.id === id);
                const proj = projects.find((p) => p.id === rc?.projectId);
                if (!rc) return null;
                return (
                  <div key={id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <HiCheck style={{ width: 14, height: 14, color: "#4f46e5", flexShrink: 0 }} />
                    <span className="chip chip-indigo" style={{ fontSize: 9 }}>{proj?.name}</span>
                    <span style={{ fontSize: 12, color: "#374151" }}>{truncate(rc.content)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>戻る</button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                onClick={() => { setTodayFromIds(addedIds); setHasStartReported(true); setStartReportedDate(new Date().toDateString()); setShowConfirmModal(false); setShowCompleted(true); }}>
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
            <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", padding: "16px 20px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>RepoCaを編集</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* プロジェクト */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>プロジェクト</label>
                <select
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                  ))}
                </select>
              </div>

              {/* 内容 */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>内容</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12, resize: "none" }}
                />
              </div>

              {/* 種別 */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>種別</label>
                <select
                  value={editTaskType}
                  onChange={(e) => setEditTaskType(e.target.value as TaskType)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
                >
                  {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* ラベル */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>ラベル</label>
                <select
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value as TaskLabel)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
                >
                  {TASK_LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              {/* 実装範囲 */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>実装範囲</label>
                <select
                  value={editImplScope}
                  onChange={(e) => setEditImplScope(e.target.value as ImplScope)}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12 }}
                >
                  {IMPL_SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingRepoCa(null)}>キャンセル</button>
              <button
                className="btn"
                style={{ flex: 2, background: "linear-gradient(90deg,#1e1b4b,#312e81)", color: "white" }}
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
