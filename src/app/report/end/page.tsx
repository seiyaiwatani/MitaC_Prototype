"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects, currentUser } from "@/lib/mock-data";

const DURATIONS = [0, 15, 30, 45, 60, 90, 120, 150, 180, 240];

// Figmaの色: #35f5b5(フロント), #694de4(バック), #f59e0b(インフラ), #ef4444(フルスタック), #757575(その他)
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
  const [durations, setDurations]     = useState<Record<string, number>>({ rc1: 120, rc2: 90, rc3: 60 });
  const [completed, setCompleted]     = useState<Record<string, boolean>>({ rc1: false, rc2: false, rc3: true });
  const [extraIds,  setExtraIds]      = useState<string[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
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

  const Header = () => (
    <header style={{
      height: 56, flexShrink: 0,
      display: "flex", alignItems: "center",
      padding: "0 16px", gap: 12,
      background: "linear-gradient(90deg,#f59e0b,#d97706)", color: "white",
    }}>
      <span style={{ fontWeight: 800, fontSize: 16, flexShrink: 0 }}>Mita=C</span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>
          <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${xpPct}%`, height: "100%", background: "rgba(255,255,255,0.95)", borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 10, opacity: 0.8 }}>アバター→</span>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚔️</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 700, fontSize: 12 }}>{currentUser.name}</span>
          <span style={{ fontSize: 10, opacity: 0.8 }}>Lv.{currentUser.level}</span>
        </div>
      </div>
    </header>
  );

  /* ── 確認画面 ── */
  if (showConfirm) {
    return (
      <div className="page-root">
        <Header />
        <div className="page-body" style={{ padding: 12, flexDirection: "column", gap: 10, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#92400e" }}>🌇 終業報告 — 確認</div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>確認ステータス</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[{ label: "始業報告", ok: true }, { label: "終業報告", ok: true }, { label: "残業報告", ok: false }].map((r) => (
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
                <span>総工数</span><span style={{ fontWeight: 700 }}>{fmt(totalMin)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>獲得XP</span>
                <span style={{ fontWeight: 700, color: "#4f46e5" }}>+{totalXp} XP</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
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
      <Header />

      <div className="page-body" style={{ padding: 10, gap: 10 }}>

        {/* 左・メインエリア: 積み上げ横棒グラフ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          <div style={{ fontWeight: 700, fontSize: 13, color: "#1e1b4b", marginBottom: 8, flexShrink: 0 }}>
            🌇 本日の工数 — {fmt(totalMin)}
          </div>

          {/* 凡例 */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", flexShrink: 0 }}>
            {Object.entries(SCOPE_COLOR).map(([scope, color]) => (
              <div key={scope} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <span style={{ color: "#4b5563" }}>{scope}</span>
              </div>
            ))}
          </div>

          {/* バーチャート */}
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
                  <div key={id} style={{ marginBottom: 14 }}>
                    {/* タスク名 + 完了フラグ */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <button
                        style={{
                          width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                          border: `2px solid ${done ? "#10b981" : "#d1d5db"}`,
                          background: done ? "#10b981" : "white",
                          color: "white", fontSize: 10, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 0,
                        }}
                        onClick={() => setCompleted((p) => ({ ...p, [id]: !p[id] }))}
                      >
                        {done ? "✓" : ""}
                      </button>
                      <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {proj?.name}
                      </span>
                      <span style={{ fontSize: 11, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rc.content}
                      </span>
                      {done && <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, flexShrink: 0 }}>+10XP</span>}
                    </div>

                    {/* 横棒グラフ + 工数セレクト */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Y軸ラベル */}
                      <div style={{ width: 36, fontSize: 10, color: "#6b7280", textAlign: "right", flexShrink: 0 }}>
                        {dur === 0 ? "0分" : fmt(dur)}
                      </div>
                      {/* バー */}
                      <div style={{ flex: 1, height: 20, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                        <div style={{
                          width: `${barPct}%`, height: "100%",
                          background: color, borderRadius: 4,
                          transition: "width 0.3s ease",
                        }} />
                        {/* グリッド線 */}
                        {[25, 50, 75].map((pct) => (
                          <div key={pct} style={{
                            position: "absolute", top: 0, bottom: 0,
                            left: `${pct}%`, width: 1,
                            background: "rgba(255,255,255,0.6)",
                          }} />
                        ))}
                      </div>
                      {/* 工数セレクト */}
                      <select
                        value={durations[id] ?? 0}
                        onChange={(e) => setDurations((p) => ({ ...p, [id]: Number(e.target.value) }))}
                        style={{ fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 4px", background: "white", flexShrink: 0 }}
                      >
                        {DURATIONS.map((d) => <option key={d} value={d}>{d === 0 ? "0分" : fmt(d)}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X軸目盛り */}
          <div style={{ flexShrink: 0, paddingLeft: 44, display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9ca3af", marginTop: 2 }}>
            <span>0h</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
          </div>
        </div>

        {/* 右パネル: 追加可能RepoCa (AddPanel表示時) */}
        {showAddPanel && (
          <div style={{
            width: 220, flexShrink: 0,
            display: "flex", flexDirection: "column",
            border: "1px solid #e5e7eb", borderRadius: 8,
            overflow: "hidden", background: "white",
          }}>
            <div style={{
              padding: "8px 12px", fontWeight: 700, fontSize: 12,
              borderBottom: "1px solid #e5e7eb",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span>RepoCaを追加</span>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#6b7280" }}
                onClick={() => setShowAddPanel(false)}
              >✕</button>
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
                        <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", display: "inline-flex", marginBottom: 3 }}>{proj?.name}</span>
                        <p style={{ fontSize: 11, fontWeight: 500, color: "#1f2937", margin: 0 }}>{rc.content}</p>
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

      {/* 下部ボタン */}
      <div style={{ flexShrink: 0, padding: "10px 16px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: "7px 14px" }}
          onClick={() => setShowAddPanel((p) => !p)}
        >
          + RepoCaを追加
        </button>
        <div style={{ flex: 1 }} />
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
