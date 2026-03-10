"use client";

import { useState } from "react";
import Link from "next/link";
import { HiClipboardList, HiCheck, HiX, HiStar, HiOutlineStar } from "react-icons/hi";
import { RepoCa } from "@/types";
import { fmtDuration } from "@/lib/utils";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const TASK_ICON: Record<string, string> = { 開発: "💻", MTG: "🤝", その他: "📌", デイリースクラム: "🔄", 実装: "⚙️" };

export default function ReportIndex() {
  const { allRepoCas, hasStartReported, hasOvertimeReported, hasEndReported } = useRepoCa();
  const { projects } = useProjects();
  const reportStatus = [
    { key: "start",    label: "始業報告", done: hasStartReported,    href: "/report/start" },
    { key: "overtime", label: "残業報告", done: hasOvertimeReported, href: "/report/overtime" },
    { key: "end",      label: "終業報告", done: hasEndReported,      href: "/report/end" },
  ];
  const [localRepoCas, setLocalRepoCas] = useState<RepoCa[]>(
    allRepoCas.filter((r) => ["rc1","rc2","rc3","rc4","rc5"].includes(r.id))
  );
  const [selectedRc, setSelectedRc] = useState<RepoCa | null>(null);

  const toggleTask = (id: string) =>
    setLocalRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  const completedCount = localRepoCas.filter((r) => r.isCompleted).length;

  return (
    <div className="page-root">

      {/* サブヘッダー */}
      <div className="page-subheader">
        <HiClipboardList style={{ width: 18, height: 18, color: "#4f46e5" }} />
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>報告</span>
      </div>

      {/* 2カラム */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 8, overflow: "hidden" }}>

        {/* 左: 本日のタスク */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: 14, textAlign: "center", borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            〜本日のタスク〜
          </div>
          <div className="scroll-y" style={{ flex: 1, padding: 8 }}>
            {localRepoCas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>カードが作成されていません</p>
                <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>下のボタンからカードを作成しよう！</p>
                <Link href="/repoca/new">
                  <button className="btn btn-primary" style={{ fontSize: 12 }}>カード作成</button>
                </Link>
              </div>
            ) : (
              localRepoCas.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "8px 4px", borderBottom: "1px solid #f3f4f6",
                  }}>
                    {/* チェックボタン */}
                    <button
                      onClick={() => toggleTask(rc.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, marginTop: 2 }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                        background: rc.isCompleted ? "#10b981" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                        transition: "all 0.15s",
                      }}>
                        {rc.isCompleted && <HiCheck style={{ width: 10, height: 10 }} />}
                      </div>
                    </button>
                    {/* お気に入りボタン */}
                    <button
                      onClick={(e) => toggleFavorite(rc.id, e)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, display: "flex", alignItems: "center", marginTop: 2 }}
                    >
                      {rc.isFavorite
                        ? <HiStar style={{ width: 15, height: 15, color: "#d97706" }} />
                        : <HiOutlineStar style={{ width: 15, height: 15, color: "#d1d5db" }} />}
                    </button>
                    {/* テキスト（クリックで詳細） */}
                    <div
                      style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                      onClick={() => setSelectedRc(rc)}
                    >
                      <p style={{
                        fontSize: 13, margin: 0, fontWeight: 500,
                        color: rc.isCompleted ? "#9ca3af" : "#1f2937",
                        textDecoration: rc.isCompleted ? "line-through" : "none",
                      }}>
                        {rc.content}
                      </p>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{proj?.name}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右: 報告ステータス */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontWeight: 700, fontSize: 14, textAlign: "center", borderBottom: "1px solid #e5e7eb", flexShrink: 0, color: "#1a1a2e" }}>
            〜報告ステータス〜
          </div>
          <div style={{ padding: "12px 20px", flex: 1 }}>
            {reportStatus.map((s) => (
              <Link key={s.key} href={s.href} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0", borderBottom: "1px solid #f3f4f6",
                }}>
                  <span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>{s.label}</span>
                  <span style={{
                    fontWeight: 700, fontSize: 12, padding: "3px 14px", borderRadius: 99,
                    background: s.done ? "#dcfce7" : "#fee2e2",
                    color: s.done ? "#166534" : "#991b1b",
                  }}>
                    {s.done ? "提出済" : "未提出"}
                  </span>
                </div>
              </Link>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", alignItems: "center" }}>
              <span style={{ fontSize: 15, color: "#374151", fontWeight: 500 }}>完了タスク</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>
                {completedCount}/{localRepoCas.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 下部3ボタン */}
      <div style={{
        flexShrink: 0, padding: "8px 12px",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
        background: "#f3f4f6", borderTop: "1px solid #e5e7eb",
      }}>
        {[
          { href: "/report/start",    label: "始業報告" },
          { href: "/report/end",      label: "終業報告" },
          { href: "/report/overtime", label: "残業報告" },
        ].map((btn) => (
          <Link key={btn.href} href={btn.href}>
            <button className="btn" style={{
              width: "100%", background: "white", color: "#374151",
              border: "1px solid #e5e7eb", fontSize: 13, padding: "10px",
            }}>
              {btn.label}
            </button>
          </Link>
        ))}
      </div>

      {/* RepoCa詳細モーダル */}
      {selectedRc && (() => {
        const proj = projects.find((p) => p.id === selectedRc.projectId);
        const rows = [
          { label: "プロジェクト", value: proj?.name ?? "—" },
          { label: "タスク種別",   value: `${TASK_ICON[selectedRc.taskType] ?? "📌"} ${selectedRc.taskType}` },
          { label: "ラベル",       value: selectedRc.label },
          { label: "実装スコープ", value: selectedRc.implScope },
          { label: "工数",         value: selectedRc.duration > 0 ? fmtDuration(selectedRc.duration) : "未記入" },
          { label: "獲得XP",       value: `+${selectedRc.xp} XP` },
          { label: "作成日",       value: selectedRc.createdAt.slice(0, 10) },
          { label: "ステータス",   value: selectedRc.isCompleted ? "✓ 完了" : "未完了" },
        ];
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setSelectedRc(null)}
          >
            <div
              style={{ background: "white", borderRadius: 16, width: 320, maxWidth: "92vw", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  {proj && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: proj.color, color: proj.textColor, display: "inline-block", marginBottom: 6 }}>
                      {proj.icon} {proj.name}
                    </span>
                  )}
                  <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.4 }}>{selectedRc.content}</p>
                </div>
                <button onClick={() => setSelectedRc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 0 }}>
                  <HiX style={{ width: 18, height: 18 }} />
                </button>
              </div>
              <div style={{ padding: "14px 20px 10px" }}>
                {rows.map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: 12 }}>
                    <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
                    <span style={{
                      color: r.label === "ステータス" ? (selectedRc.isCompleted ? "#10b981" : "#9ca3af") :
                             r.label === "獲得XP"     ? "#4f46e5" : "#1f2937",
                      fontWeight: r.label === "獲得XP" ? 700 : 500,
                    }}>
                      {r.value}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 20px 18px", display: "flex", gap: 8 }}>
                <button
                  onClick={() => { toggleTask(selectedRc.id); setSelectedRc(null); }}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer",
                    background: selectedRc.isCompleted ? "#fee2e2" : "#dcfce7",
                    color: selectedRc.isCompleted ? "#991b1b" : "#166534",
                  }}
                >
                  {selectedRc.isCompleted ? "未完了に戻す" : "完了にする"}
                </button>
                <button
                  onClick={() => setSelectedRc(null)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "none", background: "#f3f4f6", fontWeight: 700, fontSize: 12, cursor: "pointer", color: "#374151" }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
