"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { projects, currentUser } from "@/lib/mock-data";
import { TaskType, TaskLabel, ImplScope } from "@/types";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

const SCOPE_COLORS: Record<ImplScope, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};

export default function NewRepoCa() {
  const router = useRouter();
  const [projectId,  setProjectId]  = useState(projects[0].id);
  const [taskType,   setTaskType]   = useState<TaskType>("開発");
  const [label,      setLabel]      = useState<TaskLabel>("新規作成");
  const [implScope,  setImplScope]  = useState<ImplScope>("フロント");
  const [content,    setContent]    = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const xp = taskType === "開発" ? 50 : taskType === "MTG" ? 20 : 30;

  const handleSubmit = () => {
    if (!content.trim()) { alert("タスク内容を入力してください"); return; }
    alert(`RepoCaを作成しました！\n✨ +${xp} XP`);
    router.push("/repoca");
  };

  return (
    <div className="page-root">
      <PageHeader
        background="linear-gradient(90deg,#10b981,#059669)"
        xpBadge={`+${xp} XP`}
      />

      {/* フォーム（内部スクロール） */}
      <div className={`page-body ${styles.new_repoca_form_body}`}>
        <div className={`scroll-y ${styles.new_repoca_form_scroll}`}>

          {/* プロジェクト */}
          <div>
            <label className={styles.new_repoca_field_label}>
              📁 プロジェクト <span className={styles.new_repoca_required}>*</span>
            </label>
            <select
              className={styles.new_repoca_select}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* タスク種類 */}
          <div>
            <label className={styles.new_repoca_field_label}>
              🔧 タスク種類 <span className={styles.new_repoca_required}>*</span>
            </label>
            <div className={styles.new_repoca_task_type_row}>
              {(["開発", "MTG", "その他"] as TaskType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTaskType(t)}
                  className={`${styles.new_repoca_task_type_btn} ${taskType === t ? styles["new_repoca_task_type_btn--active"] : styles["new_repoca_task_type_btn--idle"]}`}
                >
                  {t === "開発" ? "💻" : t === "MTG" ? "🤝" : "📌"} {t}
                </button>
              ))}
            </div>
          </div>

          {/* ラベル */}
          <div>
            <label className={styles.new_repoca_field_label}>
              🏷 ラベル <span className={styles.new_repoca_required}>*</span>
            </label>
            <div className={styles.new_repoca_label_row}>
              {(["新規作成", "修正", "調査", "レビュー"] as TaskLabel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`${styles.new_repoca_label_btn} ${label === l ? styles["new_repoca_label_btn--active"] : styles["new_repoca_label_btn--idle"]}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 実装範囲 */}
          <div>
            <label className={styles.new_repoca_field_label}>
              🖥 実装範囲 <span className={styles.new_repoca_required}>*</span>
            </label>
            <div className={styles.new_repoca_scope_row}>
              {(["フロント", "バック", "インフラ", "フルスタック", "その他"] as ImplScope[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setImplScope(s)}
                  className={styles.new_repoca_scope_btn}
                  style={{
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
            <label className={styles.new_repoca_field_label}>
              📝 タスク内容 <span className={styles.new_repoca_required}>*</span>
            </label>
            <textarea
              className={styles.new_repoca_textarea}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例）ログイン画面のUI実装、認証APIのバグ修正..."
              rows={3}
            />
            <div className={styles.new_repoca_char_count}>{content.length}文字</div>
          </div>

          {/* お気に入り */}
          <button
            className={styles.new_repoca_favorite_btn}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <span className={styles.new_repoca_favorite_btn_icon}>{isFavorite ? "⭐" : "☆"}</span>
            <span className={`${styles.new_repoca_favorite_btn_label} ${isFavorite ? styles["new_repoca_favorite_btn_label--active"] : styles["new_repoca_favorite_btn_label--inactive"]}`}>
              お気に入りに追加
            </span>
          </button>
        </div>

        {/* 下部ボタン */}
        <div className={styles.new_repoca_footer}>
          <Link href="/repoca" style={{ flex: 1 }}>
            <button className="btn btn-ghost" style={{ width: "100%" }}>キャンセル</button>
          </Link>
          <button
            className="btn"
            style={{ flex: 2, background: "linear-gradient(90deg,#10b981,#059669)", color: "white" }}
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
