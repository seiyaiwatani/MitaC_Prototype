"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects } from "@/lib/mock-data";

const DURATIONS = [0, 15, 30, 45, 60, 90, 120, 150, 180, 240];
const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};

const fmt = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
};

export default function EndReport() {
  const router = useRouter();
  // 今日の始業で選択済みの想定
  const todayIds = ["rc1", "rc2", "rc3"];
  const [durations, setDurations]   = useState<Record<string, number>>({ rc1: 120, rc2: 90, rc3: 60 });
  const [completed, setCompleted]   = useState<Record<string, boolean>>({ rc1: false, rc2: false, rc3: true });
  const [extraIds,  setExtraIds]    = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const allSelectedIds = [...todayIds, ...extraIds];
  const available = repoCas.filter((r) => !allSelectedIds.includes(r.id));
  const totalMin  = allSelectedIds.reduce((s, id) => s + (durations[id] ?? 0), 0);
  const totalXp   = allSelectedIds.reduce((s, id) => {
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
        <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}>
          <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 22 }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 15 }}>🌇 終業報告 — 確認</span>
        </header>
        <div className="page-body" style={{ padding: 12, flexDirection: "column", gap: 10, overflowY: "auto" }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>確認スタータス</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "始業報告", ok: true  },
                { label: "終業報告", ok: true  },
                { label: "残業報告", ok: false },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span>{r.label}</span>
                  <span className={r.ok ? "status-ok" : "status-ng"}>{r.ok ? "確認済" : "未確認"}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                <span>完了タスク</span>
                <span style={{ fontWeight: 700 }}>{Object.values(completed).filter(Boolean).length}/{allSelectedIds.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>総工数</span>
                <span style={{ fontWeight: 700 }}>{fmt(totalMin)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>獲得XP</span>
                <span style={{ fontWeight: 700, color: "#4f46e5" }}>+{totalXp} XP</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>修正</button>
            <button className="btn btn-primary" style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)" }}
              onClick={() => { alert(`終業報告を提出！\n総工数: ${fmt(totalMin)}\n+${totalXp} XP`); router.push("/"); }}>
              送信
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 2カラム選択画面 ── */
  return (
    <div className="page-root">
      <header style={{ height: 48, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: 22 }}>←</Link>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🌇 終業報告</span>
        <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.9 }}>
          総工数: {fmt(totalMin)} / +{totalXp}XP
        </span>
      </header>

      <div className="page-body split-layout">

        {/* 左列: 今日のカード（時間入力） */}
        <div className="split-col">
          <div className="split-col-header">
            <span>今日のカードを追加</span>
            <span className="chip chip-yellow">{allSelectedIds.length}枚</span>
          </div>
          <div className="split-col-body">
            {allSelectedIds.map((id) => {
              const rc = repoCas.find((r) => r.id === id);
              if (!rc) return null;
              const proj = getProj(rc.projectId);
              const done = completed[id] ?? false;
              return (
                <div key={id} className="card" style={{ padding: 8, marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                    <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {proj?.name}
                    </span>
                    <span className="chip" style={{ fontSize: 10, background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
                      {rc.implScope}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 500, color: "#1f2937", margin: "0 0 6px" }}>{rc.content}</p>

                  {/* 工数セレクト */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>⏱ 工数:</span>
                    <select
                      value={durations[id] ?? 0}
                      onChange={(e) => setDurations((p) => ({ ...p, [id]: Number(e.target.value) }))}
                      style={{ flex: 1, fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 4px", background: "white" }}
                    >
                      {DURATIONS.map((d) => <option key={d} value={d}>{d === 0 ? "0分" : fmt(d)}</option>)}
                    </select>
                  </div>

                  {/* 完了フラグ */}
                  <button
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11 }}
                    onClick={() => setCompleted((p) => ({ ...p, [id]: !p[id] }))}
                  >
                    <span style={{
                      width: 16, height: 16, borderRadius: 3, border: `2px solid ${done ? "#10b981" : "#d1d5db"}`,
                      background: done ? "#10b981" : "white", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
                    }}>{done ? "✓" : ""}</span>
                    <span style={{ color: done ? "#10b981" : "#6b7280" }}>
                      完了{done && <span style={{ color: "#f59e0b", marginLeft: 4 }}>+10XP</span>}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右列: 追加できるRepoCa */}
        <div className="split-col">
          <div className="split-col-header">
            <span>類似カードを追加</span>
            <Link href="/repoca/new" style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none" }}>+ 新規</Link>
          </div>
          <div className="split-col-body">
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
                      <div style={{ display: "flex", gap: 3, marginBottom: 3 }}>
                        <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>{proj?.name}</span>
                      </div>
                      <p style={{ fontSize: 11, fontWeight: 500, color: "#1f2937", margin: 0 }}>{rc.content}</p>
                    </div>
                    <span style={{ fontSize: 14, marginLeft: 6 }}>{isExtra ? "✅" : "⬜"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 下部ボタン */}
      <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
        <Link href="/" style={{ flex: 1 }}>
          <button className="btn btn-ghost" style={{ width: "100%" }}>戻る</button>
        </Link>
        <button
          className="btn"
          style={{ flex: 2, background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white" }}
          onClick={() => setShowConfirm(true)}
        >
          終業報告送信
        </button>
      </div>
    </div>
  );
}
