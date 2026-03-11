"use client";

import { useState } from "react";
import Link from "next/link";
import { HiArrowLeft, HiPaperAirplane, HiClock, HiCheckCircle } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";

export default function OvertimeReport() {
  const { hasStartReported, hasOvertimeReported, setHasOvertimeReported, startReportedDate, overtimeReportedDate, setOvertimeReportedDate } = useRepoCa();
  const [hasOvertime, setHasOvertime] = useState<boolean | null>(null);
  const [hours,   setHours]   = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [content, setContent] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const handleSubmit = () => {
    if (hasOvertime === null) return;
    setHasOvertimeReported(true);
    setOvertimeReportedDate(new Date().toDateString());
    setShowCompleted(true);
  };

  /* ── 残業報告済み: 日付によって表示を切り替え ── */
  const todayStr = new Date().toDateString();
  const isOvertimeReportedToday = overtimeReportedDate === todayStr;

  // 同日中に残業報告ページを再訪した場合（resetDailyReports後含む） → 完了メッセージ
  if (!hasStartReported && isOvertimeReportedToday) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>残業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            提出完了。お疲れ様でした！
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.8 }}>
            本日の残業報告は完了しています。
          </p>
          <Link href="/report">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>報告一覧に戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  // 日付が変わった後に残業報告ページを訪れた場合 → 始業報告を促す
  if (!hasStartReported && overtimeReportedDate && overtimeReportedDate !== todayStr) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>残業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            始業報告を行ってください
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            新しい日が始まりました。<br />まずは始業報告を提出しましょう。
          </p>
          <Link href="/report/start">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>始業報告する</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── 始業未報告ブロック ── */
  if (!hasStartReported) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>残業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            始業報告が提出されていません
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            残業報告は始業報告を提出した後に<br />行うことができます
          </p>
          <Link href="/report/start">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>始業報告する</button>
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
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>残業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            提出完了。お疲れ様でした！
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.8 }}>
            {hasOvertime ? `残業時間: ${hours}時間${minutes}分` : "残業なし — 定時退社です！"}
          </p>
          <Link href="/report">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>報告一覧に戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  /* ── 提出済みブロック（再訪時） ── */
  if (hasOvertimeReported) {
    return (
      <div className="page-root">
        <div className="page-subheader">
          <Link href="/report" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
            <HiArrowLeft style={{ width: 20, height: 20 }} />
          </Link>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>残業報告</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: 0 }}>
            提出完了。お疲れ様でした！
          </p>
          <p style={{ fontSize: 14, color: "#6b7280", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
            本日の残業報告は完了しています。
          </p>
          <Link href="/report">
            <button className="btn btn-primary" style={{ marginTop: 8 }}>報告一覧に戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/report" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>残業報告</span>
      </div>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 12, gap: 10, overflowY: "auto" }}>

        {/* 残業有無 */}
        <div className="card" style={{ padding: 14, flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 10 }}>残業はありますか？</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              onClick={() => setHasOvertime(true)}
              style={{
                padding: "16px 8px", borderRadius: 10,
                border: `2px solid ${hasOvertime === true ? "#4f46e5" : "#e5e7eb"}`,
                background: hasOvertime === true ? "#4f46e5" : "#f9fafb",
                color: hasOvertime === true ? "white" : "#374151",
                cursor: "pointer", fontWeight: 700, fontSize: 14,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <HiClock style={{ width: 28, height: 28 }} />
              残業あり
            </button>
            <button
              onClick={() => setHasOvertime(false)}
              style={{
                padding: "16px 8px", borderRadius: 10,
                border: `2px solid ${hasOvertime === false ? "#10b981" : "#e5e7eb"}`,
                background: hasOvertime === false ? "#10b981" : "#f9fafb",
                color: hasOvertime === false ? "white" : "#374151",
                cursor: "pointer", fontWeight: 700, fontSize: 14,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              }}
            >
              <HiCheckCircle style={{ width: 28, height: 28 }} />
              残業なし
            </button>
          </div>
        </div>

        {/* 残業詳細 */}
        {hasOvertime === true && (
          <div className="card" style={{ padding: 14, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>残業詳細</div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>残業時間</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={hours} onChange={(e) => setHours(Number(e.target.value))}
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }}>
                  {[0,1,2,3,4,5].map((h) => <option key={h} value={h}>{h}時間</option>)}
                </select>
                <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}
                  style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }}>
                  {[0,15,30,45].map((m) => <option key={m} value={m}>{m}分</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>残業内容</label>
              <textarea
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="残業で行う作業内容を入力してください..."
                rows={3}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "7px 10px", fontSize: 14, resize: "none" }}
              />
            </div>
          </div>
        )}

        {hasOvertime === false && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 10,
            background: "#ecfdf5", border: "2px solid #10b981", flexShrink: 0,
          }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <div>
              <p style={{ fontWeight: 700, color: "#065f46", margin: 0, fontSize: 14 }}>お疲れ様でした！</p>
              <p style={{ fontSize: 14, color: "#047857", margin: "2px 0 0" }}>定時退社でミッションボーナスの対象です</p>
            </div>
          </div>
        )}
      </div>

      {/* 下部ボタン */}
      <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
        <Link href="/report" style={{ flex: 1 }}>
          <button className="btn btn-ghost" style={{ width: "100%" }}>戻る</button>
        </Link>
        <button
          className="btn"
          style={{ flex: 2, color: "white", background: hasOvertime === null ? "#d1d5db" : "linear-gradient(90deg,#1e1b4b,#312e81)" }}
          disabled={hasOvertime === null}
          onClick={() => setShowConfirmModal(true)}
        >
          <HiPaperAirplane style={{ width: 15, height: 15, transform: "rotate(90deg)" }} /> 提出する
        </button>
      </div>

      {/* 確認モーダル */}
      {showConfirmModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 340, maxWidth: "92vw", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", padding: "16px 20px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>残業報告の確認</p>
            </div>
            <div style={{ padding: "14px 20px" }}>
              {[
                { label: "残業", value: hasOvertime ? "あり" : "なし" },
                ...(hasOvertime ? [
                  { label: "残業時間", value: `${hours}時間${minutes}分` },
                  { label: "残業内容", value: content || "（未入力）" },
                ] : []),
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14 }}>
                  <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
                  <span style={{ color: "#1f2937", fontWeight: 500, maxWidth: 180, textAlign: "right" }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)}>戻る</button>
              <button className="btn" style={{ flex: 2, background: "linear-gradient(90deg,#1e1b4b,#312e81)", color: "white" }}
                onClick={() => { setShowConfirmModal(false); handleSubmit(); }}>
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
