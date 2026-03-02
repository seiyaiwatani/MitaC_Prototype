"use client";

import Link from "next/link";
import { HiClipboardList, HiCheck, HiDotsVertical } from "react-icons/hi";
import { repoCas, projects } from "@/lib/mock-data";

const REPORT_STATUS = [
  { key: "start",    label: "始業報告", done: true,  href: "/report/start" },
  { key: "overtime", label: "残業報告", done: false, href: "/report/overtime" },
  { key: "end",      label: "終業報告", done: false, href: "/report/end" },
];

export default function ReportIndex() {
  const todayRepoCas   = repoCas.filter((r) => ["rc1","rc2","rc3","rc4","rc5"].includes(r.id));
  const completedCount = todayRepoCas.filter((r) => r.isCompleted).length;

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
            {todayRepoCas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>カードが作成されていません</p>
                <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12 }}>下のボタンからカードを作成しよう！</p>
                <Link href="/repoca/new">
                  <button className="btn btn-primary" style={{ fontSize: 12 }}>カード作成</button>
                </Link>
              </div>
            ) : (
              todayRepoCas.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div key={rc.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "8px 4px", borderBottom: "1px solid #f3f4f6",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                      border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                      background: rc.isCompleted ? "#10b981" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10,
                    }}>
                      {rc.isCompleted && <HiCheck style={{ width: 10, height: 10 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, margin: 0, fontWeight: 500, color: "#1f2937" }}>{rc.content}</p>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{proj?.name}</span>
                    </div>
                    <HiDotsVertical style={{ color: "#9ca3af", cursor: "pointer", width: 16, height: 16 }} />
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
            {REPORT_STATUS.map((s) => (
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
                {completedCount}/{todayRepoCas.length}
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
    </div>
  );
}
