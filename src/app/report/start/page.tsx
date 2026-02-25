"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { repoCas, projects, currentUser } from "@/lib/mock-data";
import { RepoCa } from "@/types";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};

export default function StartReport() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const favorites  = repoCas.filter((r) => r.isFavorite);
  const others     = repoCas.filter((r) => !r.isFavorite);
  const allCards   = [...favorites, ...others];
  const totalXp    = selected.reduce((s, id) => s + (repoCas.find((r) => r.id === id)?.xp ?? 0), 0);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const getProj = (pid: string) => projects.find((p) => p.id === pid);

  const Header = () => (
    <header style={{
      height: 56, flexShrink: 0,
      display: "flex", alignItems: "center",
      padding: "0 16px", gap: 12,
      background: "linear-gradient(90deg,#4f46e5,#7c3aed)", color: "white",
    }}>
      <span style={{ fontWeight: 800, fontSize: 16, flexShrink: 0 }}>Mita=C</span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
          <span>XP</span><span>{currentUser.xp}/{currentUser.xpToNext}</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.25)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${xpPct}%`, height: "100%", background: "rgba(255,255,255,0.9)", borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 10, opacity: 0.7 }}>アバター→</span>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚔️</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 700, fontSize: 12 }}>{currentUser.name}</span>
          <span style={{ fontSize: 10, opacity: 0.75 }}>Lv.{currentUser.level}</span>
        </div>
      </div>
    </header>
  );

  // カードコンポーネント
  const RepoCaItem = ({ rc, mini = false }: { rc: RepoCa; mini?: boolean }) => {
    const isSelected = selected.includes(rc.id);
    return (
      <div
        className={`repoca-card ${isSelected ? "selected" : ""}`}
        style={{ marginBottom: 6 }}
        onClick={() => toggle(rc.id)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 3 }}>
              <span className="chip chip-indigo" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
                {getProj(rc.projectId)?.name}
              </span>
              <span className="chip" style={{ background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
                {rc.implScope}
              </span>
            </div>
            <p style={{ fontSize: mini ? 11 : 12, fontWeight: 500, color: "#1f2937", margin: 0, lineHeight: 1.3 }}>
              {rc.content}
            </p>
            {!mini && (
              <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{rc.taskType}</span>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{rc.label}</span>
                {rc.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
                <span style={{ fontSize: 10, color: "#4f46e5", fontWeight: 700, marginLeft: "auto" }}>+{rc.xp}XP</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: 16, marginLeft: 6, flexShrink: 0 }}>
            {isSelected ? "✅" : "⬜"}
          </span>
        </div>
      </div>
    );
  };

  /* ── 確認画面 ── */
  if (showConfirm) {
    return (
      <div className="page-root">
        <Header />
        <div className="page-body" style={{ padding: 12, flexDirection: "column", gap: 10, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1e1b4b" }}>🌅 始業報告 — 確認</div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>確認ステータス</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "始業報告", ok: true },
                { label: "終業報告", ok: false },
                { label: "残業報告", ok: false },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span>{row.label}</span>
                  <span className={row.ok ? "status-ok" : "status-ng"}>{row.ok ? "確認済" : "未確認"}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 4 }}>
                <span>完了タスク</span>
                <span style={{ fontWeight: 700 }}>0/{selected.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span>獲得XP（予定）</span>
                <span style={{ fontWeight: 700, color: "#4f46e5" }}>+{totalXp} XP</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              選択済み RepoCa（{selected.length}枚）
            </div>
            {selected.map((id) => {
              const rc = repoCas.find((r) => r.id === id);
              if (!rc) return null;
              const proj = getProj(rc.projectId);
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid #f9fafb" }}>
                  <span style={{ color: "#4f46e5" }}>✓</span>
                  <span className="chip chip-indigo" style={{ fontSize: 10 }}>{proj?.name}</span>
                  <span style={{ fontSize: 12, color: "#374151" }}>{rc.content}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 4 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>戻る</button>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => { alert("始業報告を提出しました！ 🌟"); router.push("/"); }}
            >
              提出
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 選択画面（2カラム）── */
  return (
    <div className="page-root">
      <Header />

      {/* 2カラム: 左広め(追加済み) + 縦区切り + 右狭め(デッキ) */}
      <div className="page-body" style={{ padding: 0, gap: 0 }}>

        {/* 左列: 追加したRepoCa一覧 */}
        <div style={{
          flex: 3,
          display: "flex",
          flexDirection: "column",
          borderRight: "2px solid #e5e7eb",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "10px 14px",
            fontWeight: 700, fontSize: 13,
            borderBottom: "1px solid #e5e7eb",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <span>追加したRepoCa一覧</span>
            <span className="chip chip-indigo">{selected.length}枚</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div className="scroll-y" style={{ height: "100%", padding: 10 }}>
              {selected.length === 0 ? (
                <div className="repoca-card slot-empty" style={{ height: 70 }}>
                  右からカードを選択
                </div>
              ) : (
                selected.map((id) => {
                  const rc = repoCas.find((r) => r.id === id);
                  return rc ? <RepoCaItem key={id} rc={rc} mini /> : null;
                })
              )}
            </div>
          </div>

          {/* ボタン（左列下部） */}
          <div style={{ flexShrink: 0, padding: "10px 14px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
            <Link href="/" style={{ flex: 1 }}>
              <button className="btn btn-ghost" style={{ width: "100%" }}>戻る</button>
            </Link>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={selected.length === 0}
              onClick={() => setShowConfirm(true)}
            >
              提出（{selected.length}枚）
            </button>
          </div>
        </div>

        {/* 右列: RepoCaデッキ（未完了のRepoCa） */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#fafafa",
        }}>
          <div style={{
            padding: "10px 12px",
            fontWeight: 700, fontSize: 12,
            borderBottom: "1px solid #e5e7eb",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <span>未完了のRepoCa</span>
            <Link href="/repoca/new" style={{ fontSize: 11, color: "#4f46e5", textDecoration: "none" }}>+ 新規</Link>
          </div>
          <div className="scroll-y" style={{ flex: 1, padding: 8 }}>
            {favorites.length > 0 && (
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>⭐ お気に入り</div>
            )}
            {allCards.map((rc) => (
              <RepoCaItem key={rc.id} rc={rc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
