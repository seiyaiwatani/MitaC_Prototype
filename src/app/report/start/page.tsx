"use client";

import { useState } from "react";
import Link from "next/link";
import { repoCas, projects, todaySelectedIds } from "@/lib/mock-data";
import { RepoCa } from "@/types";
import { HiArrowLeft, HiCheck, HiX, HiStar, HiOutlineStar } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";

export default function StartReport() {
  const { setHasStartReported, setTodayFromIds, favoriteIds, toggleFavorite } = useRepoCa();
  // 追加したRepoCa（既に選択済みのもの）
  const [addedIds, setAddedIds] = useState<string[]>([...todaySelectedIds]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // 未完了RepoCa（addedに含まれないもの）
  const unfinished = repoCas.filter((r) => !r.isCompleted && !addedIds.includes(r.id));
  // お気に入りRepoCa（contextのfavoriteIdsベース、addedに含まれないもの）
  const favorites  = repoCas.filter((r) => favoriteIds.includes(r.id) && !addedIds.includes(r.id));

  const addToList   = (id: string) => setAddedIds((prev) => [...prev, id]);
  const removeFromList = (id: string) => setAddedIds((prev) => prev.filter((x) => x !== id));

  // PJでグループ化
  const groupByPj = (ids: string[]) => {
    const map = new Map<string, RepoCa[]>();
    ids.forEach((id) => {
      const rc = repoCas.find((r) => r.id === id);
      if (!rc) return;
      const arr = map.get(rc.projectId) ?? [];
      arr.push(rc);
      map.set(rc.projectId, arr);
    });
    return map;
  };

  const grouped = groupByPj(addedIds);

  /* ── 完了画面 ── */
  if (showCompleted) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>始業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🌅</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            始業報告が完了しました！
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

  /* ── 確認モーダル ── */
  if (showConfirm) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4f46e5", padding: 0, display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#4f46e5" }}>始業報告 — 確認</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>確認ステータス</div>
            {[
              { label: "始業報告", ok: true },
              { label: "終業報告", ok: false },
              { label: "残業報告", ok: false },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span>{r.label}</span>
                <span className={r.ok ? "status-ok" : "status-ng"}>{r.ok ? "確認済" : "未確認"}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0" }}>
              <span>選択済みRepoCa</span>
              <span style={{ fontWeight: 700 }}>{addedIds.length}枚</span>
            </div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>追加したRepoCa一覧</div>
            {addedIds.map((id) => {
              const rc   = repoCas.find((r) => r.id === id);
              const proj = projects.find((p) => p.id === rc?.projectId);
              if (!rc) return null;
              return (
                <div key={id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f9fafb" }}>
                  <HiCheck style={{ width: 14, height: 14, color: "#4f46e5", flexShrink: 0 }} />
                  <span className="chip chip-indigo" style={{ fontSize: 9 }}>{proj?.name}</span>
                  <span style={{ fontSize: 12, color: "#374151" }}>{rc.content}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>修正</button>
          <button className="btn btn-primary" style={{ flex: 2 }}
            onClick={() => { setTodayFromIds(addedIds); setHasStartReported(true); setShowCompleted(true); }}>
            送信
          </button>
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
                        <div key={rc.id} className="repoca-mini selected" style={{ position: "relative" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                            <span style={{ fontSize: 9, color: proj?.textColor ?? "#374151", fontWeight: 700 }}>
                              {rc.taskType}
                            </span>
                            <button
                              onClick={() => removeFromList(rc.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
                            >
                              <HiX style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                          <p style={{ fontSize: 11, margin: 0, fontWeight: 500, color: "#1f2937", lineHeight: 1.3 }}>
                            {rc.content}
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
                  <div key={rc.id} className="repoca-card" style={{ marginBottom: 5, padding: "7px 8px" }} onClick={() => addToList(rc.id)}>
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
          className="btn btn-primary"
          style={{ flex: 2 }}
          disabled={addedIds.length === 0}
          onClick={() => setShowConfirm(true)}
        >
          提出（{addedIds.length}枚）
        </button>
      </div>
    </div>
  );
}
