"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects, todaySelectedIds } from "@/lib/mock-data";
import { RepoCa } from "@/types";
import { HiArrowLeft, HiCheck } from "react-icons/hi";

// 0.25h刻みのドロップダウン値（0h〜12h）
const DURATION_OPTIONS: { label: string; value: number }[] = [
  { label: "0h",    value: 0 },
  { label: "0.25h", value: 15 },
  { label: "0.50h", value: 30 },
  { label: "0.75h", value: 45 },
  { label: "1.00h", value: 60 },
  { label: "1.25h", value: 75 },
  { label: "1.50h", value: 90 },
  { label: "1.75h", value: 105 },
  { label: "2.00h", value: 120 },
  { label: "2.50h", value: 150 },
  { label: "3.00h", value: 180 },
  { label: "3.50h", value: 210 },
  { label: "4.00h", value: 240 },
  { label: "4.50h", value: 270 },
  { label: "5.00h", value: 300 },
  { label: "6.00h", value: 360 },
  { label: "7.00h", value: 420 },
  { label: "8.00h", value: 480 },
];

const fmtH = (min: number) => {
  const h = min / 60;
  return `${h.toFixed(2)}h`;
};

export default function EndReport() {
  const router  = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([...todaySelectedIds]);
  const [durations,   setDurations]   = useState<Record<string, number>>({
    rc1: 60, rc2: 15, rc3: 60, rc4: 300, rc5: 30,
  });
  const [completed, setCompleted]     = useState<Record<string, boolean>>({
    rc1: true, rc2: false, rc3: false, rc4: false, rc5: false,
  });
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const available = repoCas.filter((r) => !selectedIds.includes(r.id));
  const totalMin  = selectedIds.reduce((s, id) => s + (durations[id] ?? 0), 0);
  const maxBarMin = 480; // 8h

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
  const grouped = groupByPj(selectedIds);

  // バーグラフ用: PJごとの合計分数
  const pjTotals = Array.from(grouped.entries()).map(([pjId, cards]) => ({
    pjId,
    totalMin: cards.reduce((s, rc) => s + (durations[rc.id] ?? 0), 0),
    proj: projects.find((p) => p.id === pjId)!,
  }));

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
              <span style={{ fontWeight: 700 }}>{completedCount}/{selectedIds.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0" }}>
              <span>総工数</span>
              <span style={{ fontWeight: 700 }}>{fmtH(totalMin)}</span>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>修正</button>
          <button className="btn" style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
            onClick={() => { alert(`終業報告を提出しました！\n総工数: ${fmtH(totalMin)}`); router.push("/report"); }}>
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
          総工数: {fmtH(totalMin)}
        </span>
      </div>

      {/* メインエリア: RepoCa一覧 + バーグラフ */}
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
                    return (
                      <div key={rc.id} className="card" style={{
                        padding: "8px 10px",
                        width: 160,
                        flexShrink: 0,
                        opacity: done ? 0.6 : 1,
                        background: rc.isCompleted ? "#f0fdf4" : "white",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                          <span className="chip" style={{ fontSize: 9, background: proj.color, color: proj.textColor }}>{rc.taskType}</span>
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: 0, color: rc.isFavorite ? "#f59e0b" : "#e5e7eb" }}>
                            ★
                          </button>
                        </div>
                        <p style={{ fontSize: 11, margin: "0 0 6px", fontWeight: 500, color: "#1f2937", lineHeight: 1.3 }}>
                          {rc.content}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <select
                            value={durations[rc.id] ?? 0}
                            onChange={(e) => setDurations((p) => ({ ...p, [rc.id]: Number(e.target.value) }))}
                            style={{
                              flex: 1, fontSize: 10, border: "1px solid #e5e7eb",
                              borderRadius: 4, padding: "2px 3px", background: "white",
                            }}
                          >
                            {DURATION_OPTIONS.map((d) => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </div>
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

        {/* 右: 工数バーグラフ */}
        <div style={{
          width: 56,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: "8px 4px",
          overflow: "hidden",
        }}>
          {/* 目盛り + バー */}
          <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "row", gap: 4, alignItems: "stretch" }}>
            {/* Y軸目盛り */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 8, color: "#9ca3af", alignItems: "flex-end", flexShrink: 0 }}>
              <span>—0h</span>
              <span>—4h</span>
              <span>—8h</span>
            </div>
            {/* バー本体 */}
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
              {pjTotals.map(({ pjId, totalMin: tMin, proj }) => (
                <div
                  key={pjId}
                  title={`${proj.name}: ${fmtH(tMin)}`}
                  style={{
                    width: "100%",
                    height: `${Math.min((tMin / maxBarMin) * 100, 100)}%`,
                    minHeight: tMin > 0 ? 4 : 0,
                    background: proj.color,
                    borderBottom: "1px solid rgba(255,255,255,0.6)",
                    transition: "height 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 8, color: "#6b7280", marginTop: 4, textAlign: "center" }}>
            {fmtH(totalMin)}
          </div>
        </div>
      </div>

      {/* RepoCa追加パネル */}
      {showAddPanel && (
        <div style={{
          flexShrink: 0, maxHeight: 200, overflowY: "auto",
          borderTop: "2px solid #e5e7eb", background: "#fafafa", padding: "8px 12px",
        }}>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#374151" }}>RepoCaを追加</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {available.length === 0 ? (
              <p style={{ fontSize: 11, color: "#9ca3af" }}>追加できるRepoCaがありません</p>
            ) : (
              available.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId)!;
                return (
                  <div key={rc.id} className="repoca-mini"
                    onClick={() => { setSelectedIds((prev) => [...prev, rc.id]); }}>
                    <span className="chip" style={{ fontSize: 9, background: proj.color, color: proj.textColor }}>{proj.name}</span>
                    <p style={{ fontSize: 11, margin: "3px 0 0", fontWeight: 500, color: "#1f2937" }}>{rc.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

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
        <button
          className="btn btn-ghost"
          style={{ flex: 1 }}
          onClick={() => setShowAddPanel((v) => !v)}
        >
          RepoCaを追加
        </button>
      </div>
    </div>
  );
}
