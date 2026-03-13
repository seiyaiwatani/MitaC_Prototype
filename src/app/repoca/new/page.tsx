"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TaskType, TaskLabel, ImplScope } from "@/types";
import { HiArrowLeft, HiStar, HiOutlineStar, HiTrash, HiChevronUp, HiChevronDown } from "react-icons/hi";
import { useProjects } from "@/contexts/ProjectContext";
import { useRepoCa } from "@/contexts/RepoCaContext";

type Tab = "開発" | "その他";

interface DraftCard {
  id: string;
  projectId: string;
  taskType: TaskType;
  label: TaskLabel;
  implScope: ImplScope;
  content: string;
  isFavorite: boolean;
}

function NewRepoCaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("from") ?? "/repoca";
  const { projects } = useProjects();
  const { allRepoCas, addRepoCa, addTodayRepoCa, addPendingRepoCaId } = useRepoCa();

  const initDraft = (): DraftCard => ({
    id: Date.now().toString(),
    projectId: projects[0]?.id ?? "",
    taskType: "開発",
    label: "新規作成",
    implScope: "フロント",
    content: "",
    isFavorite: false,
  });

  const [tab, setTab] = useState<Tab>("開発");
  const [draft, setDraft]     = useState<DraftCard>(() => initDraft());
  const [created, setCreated] = useState<DraftCard[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const isValid = draft.projectId && draft.label && (tab !== "開発" || draft.implScope) && draft.content.trim();

  const buildRepoCa = (d: DraftCard): import("@/types").RepoCa => ({
    ...d,
    isCompleted: false,
    duration: 0,
    xp: d.taskType === "開発" || d.taskType === "実装" ? 50 : 20,
    createdAt: new Date().toISOString(),
  });

  const addAndReport = () => {
    if (!isValid) return;
    setCreated((prev) => [...prev, { ...draft, id: Date.now().toString() }]);
    setDraft(initDraft());
  };

  const submitAll = () => {
    if (created.length === 0 && !draft.content.trim()) {
      alert("RepoCaを入力してください");
      return;
    }
    const all = draft.content.trim()
      ? [...created, { ...draft, id: Date.now().toString() }]
      : created;
    all.forEach((d) => {
      const rc = buildRepoCa(d);
      addRepoCa(rc);
      addTodayRepoCa(rc);
      addPendingRepoCaId(rc.id);
    });
    router.push(returnTo);
  };

  const removeCreated = (id: string) => setCreated((prev) => prev.filter((c) => c.id !== id));

  const xp = (tab === "開発" ? 50 : 20);

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/repoca" style={{ color: "#10b981", textDecoration: "none", lineHeight: 1, display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>RepoCa作成</span>
        <span style={{ marginLeft: "auto", background: "#dcfce7", color: "#166534", fontSize: 14, fontWeight: 700, padding: "2px 10px", borderRadius: 99 }}>
          +{xp} XP
        </span>
      </div>

      {/* 2カラム: 作成済みリスト + 作成フォーム */}
      <div className="page-body split-layout">

        {/* 左: 作成済みRepoCa */}
        <div className="split-col">
          <div className="split-col-header">
            <span>作成済みのRepoCa</span>
            <span className="chip chip-green">{created.length}件</span>
          </div>
          <div className="split-col-body">
            {created.length === 0 ? (
              <div className="repoca-card slot-empty" style={{ height: 60 }}>
                作成したRepoCaがここに表示されます
              </div>
            ) : (
              created.map((c) => {
                const proj = projects.find((p) => p.id === c.projectId);
                const isOpen = expanded === c.id;
                return (
                  <div key={c.id} className="card" style={{ padding: "8px 10px", marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 3 }}>
                          <span className="chip chip-indigo" style={{ fontSize: 14 }}>{proj?.name}</span>
                          <span className="chip chip-gray" style={{ fontSize: 14 }}>{c.label}</span>
                        </div>
                        <p style={{ fontSize: 14, margin: 0, fontWeight: 500, color: "#1f2937" }}>{c.content}</p>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 6 }}>
                        <button
                          onClick={() => setCreated((prev) => prev.map((x) => x.id === c.id ? { ...x, isFavorite: !x.isFavorite } : x))}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
                        >
                          {c.isFavorite
                            ? <HiStar style={{ width: 15, height: 15, color: "#d97706" }} />
                            : <HiOutlineStar style={{ width: 15, height: 15, color: "#d1d5db" }} />}
                        </button>
                        <button onClick={() => setExpanded(isOpen ? null : c.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#9ca3af", display: "flex", alignItems: "center" }}>
                          {isOpen ? <HiChevronUp style={{ width: 16, height: 16 }} /> : <HiChevronDown style={{ width: 16, height: 16 }} />}
                        </button>
                        <button onClick={() => removeCreated(c.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444", display: "flex", alignItems: "center" }}>
                          <HiTrash style={{ width: 15, height: 15 }} />
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #f3f4f6", fontSize: 14, color: "#6b7280", display: "flex", flexDirection: "column", gap: 2 }}>
                        <span>PJ名: {proj?.name}</span>
                        <span>ラベル: {c.label}</span>
                        <span>実装範囲: {c.implScope}</span>
                        <span>タスク種類: {c.taskType}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 右: 作成フォーム */}
        <div className="split-col">
          <div className="split-col-header">
            <span>RepoCa作成</span>
            {/* 開発/その他タブ */}
            <div style={{ display: "flex", gap: 2 }}>
              {(["開発", "その他"] as Tab[]).map((t) => (
                <button key={t} onClick={() => { setTab(t); setDraft((d) => ({ ...d, taskType: t === "開発" ? "開発" : "その他" })); }}
                  style={{
                    padding: "2px 10px", borderRadius: 99, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    background: tab === t ? "#4f46e5" : "#f3f4f6",
                    color: tab === t ? "white" : "#6b7280",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="split-col-body">

            {/* お気に入り登録 / お気に入りから選択 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <button
                onClick={() => setDraft((d) => ({ ...d, isFavorite: !d.isFavorite }))}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 14, padding: 0 }}
              >
                {draft.isFavorite
                  ? <HiStar style={{ width: 16, height: 16, color: "#d97706" }} />
                  : <HiOutlineStar style={{ width: 16, height: 16, color: "#9ca3af" }} />}
                <span style={{ color: draft.isFavorite ? "#d97706" : "#9ca3af", fontWeight: 600 }}>お気に入り登録</span>
              </button>
              <select
                onChange={(e) => {
                  const fav = allRepoCas.find((r) => r.id === e.target.value);
                  if (fav) setDraft((d) => ({ ...d, projectId: fav.projectId, label: fav.label, implScope: fav.implScope, content: fav.content }));
                }}
                style={{ fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 6px", color: "#374151" }}
              >
                <option value="">お気に入りから選択 ▼</option>
                {allRepoCas.filter((r) => r.isFavorite).map((r) => (
                  <option key={r.id} value={r.id}>{r.content}</option>
                ))}
              </select>
            </div>

            {/* PJ名 */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>
                PJ名 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select value={draft.projectId} onChange={(e) => setDraft((d) => ({ ...d, projectId: e.target.value }))}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14, color: "#374151" }}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
              </select>
            </div>

            {/* ラベル */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>
                ラベル <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value as TaskLabel }))}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14, color: "#374151" }}>
                {(["新規作成", "修正", "調査", "レビュー"] as TaskLabel[]).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* 実装範囲（開発タブのみ） */}
            {tab === "開発" && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>
                  実装範囲 <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select value={draft.implScope} onChange={(e) => setDraft((d) => ({ ...d, implScope: e.target.value as ImplScope }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14, color: "#374151" }}>
                  {(["フロント", "バック", "インフラ", "フルスタック", "その他"] as ImplScope[]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* タスク内容 */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>
                タスク内容 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                placeholder="例）Contactページ作成、デイリースクラム..."
                rows={3}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14, resize: "none", color: "#374151" }}
              />
              <div style={{ textAlign: "right", fontSize: 14, color: "#9ca3af" }}>{draft.content.length}文字</div>
            </div>

            {/* フォームボタン */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn"
                style={{ flex: 1, fontSize: 14, padding: "6px", background: "#10b981", color: "white" }}
                disabled={!isValid}
                onClick={addAndReport}
              >
                追加して続けて作成
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 下部ボタン */}
      <div style={{ flexShrink: 0, padding: "8px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, background: "white" }}>
        <Link href="/repoca" style={{ flex: 1 }}>
          <button className="btn btn-ghost" style={{ width: "100%" }}>もどる</button>
        </Link>
        <button
          className="btn"
          style={{ flex: 2, background: "linear-gradient(90deg,#10b981,#059669)", color: "white" }}
          onClick={submitAll}
          disabled={created.length === 0 && !draft.content.trim()}
        >
          {returnTo !== "/repoca" ? "報告に追加" : "カードを新規作成"}（{created.length + (draft.content.trim() ? 1 : 0)}件）
        </button>
      </div>
    </div>
  );
}

export default function NewRepoCa() {
  return (
    <Suspense fallback={<div className="page-root" />}>
      <NewRepoCaContent />
    </Suspense>
  );
}
