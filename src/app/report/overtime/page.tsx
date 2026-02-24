"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OvertimeReport() {
  const router = useRouter();
  const [hasOvertime, setHasOvertime] = useState<boolean | null>(null);
  const [hours,   setHours]   = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (hasOvertime === null) return;
    const msg = hasOvertime
      ? `残業報告を提出しました。\n残業時間: ${hours}時間${minutes > 0 ? minutes + "分" : ""}`
      : "残業なしで報告を提出しました。お疲れ様でした！";
    alert(msg);
    router.push("/");
  };

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
        background: "linear-gradient(90deg,#1e1b4b,#312e81)", color: "white",
      }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontSize: 22 }}>←</Link>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🌙 残業報告</span>
      </header>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 12, gap: 10 }}>

        {/* 残業有無 */}
        <div className="card" style={{ padding: 14, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 10 }}>残業はありますか？</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={() => setHasOvertime(true)}
              style={{
                padding: "16px 8px", borderRadius: 10, border: `2px solid ${hasOvertime === true ? "#4f46e5" : "#e5e7eb"}`,
                background: hasOvertime === true ? "#4f46e5" : "#f9fafb",
                color: hasOvertime === true ? "white" : "#374151",
                cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 28 }}>🌙</span>
              残業あり
            </button>
            <button
              onClick={() => setHasOvertime(false)}
              style={{
                padding: "16px 8px", borderRadius: 10, border: `2px solid ${hasOvertime === false ? "#10b981" : "#e5e7eb"}`,
                background: hasOvertime === false ? "#10b981" : "#f9fafb",
                color: hasOvertime === false ? "white" : "#374151",
                cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <span style={{ fontSize: 28 }}>✅</span>
              残業なし
            </button>
          </div>
        </div>

        {/* 残業詳細 */}
        {hasOvertime === true && (
          <div className="card" style={{ padding: 14, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>残業詳細</div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>残業時間</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                >
                  {[0, 1, 2, 3, 4, 5].map((h) => <option key={h} value={h}>{h}時間</option>)}
                </select>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 12 }}
                >
                  {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{m}分</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>残業内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="残業で行う作業内容を入力してください..."
                rows={3}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 12, resize: "none" }}
              />
            </div>
          </div>
        )}

        {/* 定時退社メッセージ */}
        {hasOvertime === false && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 10,
            background: "#ecfdf5", border: "2px solid #10b981", flexShrink: 0,
          }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <div>
              <p style={{ fontWeight: 700, color: "#065f46", margin: 0, fontSize: 13 }}>お疲れ様でした！</p>
              <p style={{ fontSize: 11, color: "#047857", margin: "2px 0 0" }}>
                定時退社でミッションボーナスの対象です
              </p>
            </div>
          </div>
        )}

        {/* ボタン（下部固定） */}
        <div style={{ marginTop: "auto", display: "flex", gap: 8, flexShrink: 0 }}>
          <Link href="/" style={{ flex: 1 }}>
            <button className="btn btn-ghost" style={{ width: "100%" }}>キャンセル</button>
          </Link>
          <button
            className="btn"
            style={{
              flex: 2, color: "white",
              background: hasOvertime === null ? "#d1d5db" : "linear-gradient(90deg,#1e1b4b,#312e81)",
            }}
            disabled={hasOvertime === null}
            onClick={handleSubmit}
          >
            🌙 提出する
          </button>
        </div>
      </div>
    </div>
  );
}
