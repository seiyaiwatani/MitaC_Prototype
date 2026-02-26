"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { projects, currentUser } from "@/lib/mock-data";
import { TaskType, TaskLabel, ImplScope } from "@/types";

const SCOPE_COLORS: Record<ImplScope, string> = {
  フロント: "#4f46e5",
  バック: "#10b981",
  インフラ: "#f59e0b",
  フルスタック: "#ef4444",
  その他: "#6b7280",
};

export default function NewRepoCa() {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0].id);
  const [taskType, setTaskType] = useState<TaskType>("開発");
  const [label, setLabel] = useState<TaskLabel>("新規作成");
  const [implScope, setImplScope] = useState<ImplScope>("フロント");
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const xp = taskType === "開発" ? 50 : taskType === "MTG" ? 20 : 30;
  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);

  const handleSubmit = () => {
    if (!content.trim()) {
      alert("タスク内容を入力してください");
      return;
    }
    alert(`RepoCaを作成しました！\n✨ +${xp} XP`);
    router.push("/repoca");
  };

  return (
    <div className="page-root">
      {/* ヘッダー：ロゴ | XPバー | アバター */}
      <header
        style={{
          height: 56,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          background: "linear-gradient(90deg,#10b981,#059669)",
          color: "white",
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
          Mita=C
        </span>
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span>XP</span>
            <span>
              {currentUser.xp}/{currentUser.xpToNext}
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: "rgba(255,255,255,0.3)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${xpPct}%`,
                height: "100%",
                background: "rgba(255,255,255,0.95)",
                borderRadius: 3,
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              border: "2px solid rgba(255,255,255,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
            }}
          >
            ⚔️
          </div>
          <span style={{ fontWeight: 700, fontSize: 12 }}>
            {currentUser.name}
          </span>
        </div>
        <span
          style={{
            background: "rgba(255,255,255,0.9)",
            color: "#059669",
            fontWeight: 800,
            fontSize: 13,
            padding: "3px 12px",
            borderRadius: 99,
            flexShrink: 0,
          }}
        >
          +{xp} XP
        </span>
      </header>

      {/* フォーム（内部スクロール） */}
      <div className="page-body" style={{ flexDirection: "column" }}>
        <div
          className="scroll-y"
          style={{
            flex: 1,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* プロジェクト */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                display: "block",
                marginBottom: 4,
              }}
            >
              📁 プロジェクト <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 12,
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* タスク種類 */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                display: "block",
                marginBottom: 4,
              }}
            >
              🔧 タスク種類 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["開発", "MTG", "その他"] as TaskType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTaskType(t)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: 8,
                    border: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: taskType === t ? "#4f46e5" : "#f3f4f6",
                    color: taskType === t ? "white" : "#374151",
                  }}
                >
                  {t === "開発" ? "💻" : t === "MTG" ? "🤝" : "📌"} {t}
                </button>
              ))}
            </div>
          </div>

          {/* ラベル */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                display: "block",
                marginBottom: 4,
              }}
            >
              🏷 ラベル <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(["新規作成", "修正", "調査", "レビュー"] as TaskLabel[]).map(
                (l) => (
                  <button
                    key={l}
                    onClick={() => setLabel(l)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 99,
                      border: "none",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      background: label === l ? "#6366f1" : "#f3f4f6",
                      color: label === l ? "white" : "#374151",
                    }}
                  >
                    {l}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* 実装範囲 */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                display: "block",
                marginBottom: 4,
              }}
            >
              🖥 実装範囲 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(
                [
                  "フロント",
                  "バック",
                  "インフラ",
                  "フルスタック",
                  "その他",
                ] as ImplScope[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => setImplScope(s)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    border: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "white",
                    background: SCOPE_COLORS[s],
                    opacity: implScope === s ? 1 : 0.4,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* タスク内容 */}
          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#6b7280",
                display: "block",
                marginBottom: 4,
              }}
            >
              📝 タスク内容 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例）ログイン画面のUI実装、認証APIのバグ修正..."
              rows={3}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "7px 10px",
                fontSize: 12,
                resize: "none",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 10,
                color: "#9ca3af",
                marginTop: 2,
              }}
            >
              {content.length}文字
            </div>
          </div>

          {/* お気に入り */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <span style={{ fontSize: 22 }}>{isFavorite ? "⭐" : "☆"}</span>
            <span
              style={{
                fontSize: 12,
                color: isFavorite ? "#d97706" : "#6b7280",
                fontWeight: 600,
              }}
            >
              お気に入りに追加
            </span>
          </button>
        </div>

        {/* 下部ボタン */}
        <div
          style={{
            flexShrink: 0,
            padding: "8px 12px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            gap: 8,
            background: "white",
          }}
        >
          <Link href="/repoca" style={{ flex: 1 }}>
            <button className="btn btn-ghost" style={{ width: "100%" }}>
              キャンセル
            </button>
          </Link>
          <button
            className="btn"
            style={{
              flex: 2,
              background: "linear-gradient(90deg,#10b981,#059669)",
              color: "white",
            }}
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            🃏 作成する
          </button>
        </div>
      </div>
    </div>
  );
}
