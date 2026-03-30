"use client";

import { useState } from "react";
import Link from "next/link";
import { RepoCa, TaskLabel, ImplScope } from "@/types";
import { fmtDuration } from "@/lib/utils";
import { HiCollection, HiSearch, HiCheckCircle, HiStar, HiViewGrid, HiTrash, HiCheck, HiPencilAlt } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#007aff", バック: "#10b981", インフラ: "#f59e0b",
  フルスタック: "#ef4444", その他: "#6b7280",
};
const TASK_ICON: Record<string, string> = { 開発: "💻", MTG: "🤝", その他: "📌", デイリースクラム: "🔄", 実装: "⚙️" };

const FILTERS = [
  { key: "all",        label: "すべて" },
  { key: "favorite",   label: "★お気に入り" },
  { key: "incomplete", label: "未完了" },
  { key: "completed",  label: "✓ 完了" },
] as const;

// ---- プロジェクト詳細データ ----
type MemberEntry = { name: string; role: string };
type ProjectDetail = {
  description: string;
  memberList: MemberEntry[];
  techStack: string;
  role: string;
  workContent: string;
  assignedDate: string;
};
const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  p1: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    memberList: [
      { name: "田中 一郎",    role: "PM" },
      { name: "佐藤 花子",    role: "ディレクター" },
      { name: "山田 太郎",    role: "デザイナー" },
      { name: "菊池（自分）", role: "フロントエンドエンジニア" },
      { name: "鈴木 次郎",    role: "バックエンドエンジニア" },
      { name: "伊藤 三郎",    role: "バックエンドエンジニア" },
    ],
    techStack: "Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, AWS, Docker",
    role: "フロントエンドエンジニア",
    workContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignedDate: "2026年2月9日〜",
  },
  p2: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    memberList: [
      { name: "高橋 四郎",    role: "PM" },
      { name: "渡辺 五郎",    role: "ディレクター" },
      { name: "中村 六子",    role: "ディレクター" },
      { name: "小林 七海",    role: "デザイナー" },
      { name: "加藤 八郎",    role: "デザイナー" },
      { name: "菊池（自分）", role: "フルスタックエンジニア" },
      { name: "吉田 九郎",    role: "フロントエンドエンジニア" },
      { name: "山本 十子",    role: "バックエンドエンジニア" },
      { name: "松本 十一郎",  role: "バックエンドエンジニア" },
    ],
    techStack: "WordPress, PHP, MySQL, JavaScript",
    role: "フルスタックエンジニア",
    workContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignedDate: "2026年1月15日〜",
  },
  p3: {
    description: "スマートフォン向けのライフスタイルアプリの新規開発プロジェクトです。iOS / Android 両対応のクロスプラットフォーム開発を行い、ユーザー体験を重視したUI/UX設計を進めています。",
    memberList: [
      { name: "西村 健太",    role: "PM" },
      { name: "前田 彩香",    role: "デザイナー" },
      { name: "菊池（自分）", role: "モバイルエンジニア" },
      { name: "長谷川 勇",   role: "モバイルエンジニア" },
      { name: "石田 美咲",   role: "バックエンドエンジニア" },
      { name: "藤田 拓也",   role: "バックエンドエンジニア" },
    ],
    techStack: "React Native, TypeScript, Expo, Firebase, Node.js, PostgreSQL",
    role: "モバイルエンジニア",
    workContent: "React Native を用いたモバイルアプリのフロントエンド実装を担当。画面設計・コンポーネント開発・API連携・パフォーマンス最適化を行っています。",
    assignedDate: "2026年1月15日〜",
  },
  p4: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    memberList: [
      { name: "井上 十二郎",  role: "PM" },
      { name: "木村 十三子",  role: "デザイナー" },
      { name: "菊池（自分）", role: "バックエンドエンジニア" },
      { name: "林 十四郎",    role: "インフラエンジニア" },
    ],
    techStack: "AWS, Python, Redshift, Airflow, Terraform",
    role: "バックエンドエンジニア",
    workContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignedDate: "2026年3月1日〜",
  },
};

type SortKey = "kana" | "project" | "created";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "created",  label: "作成順" },
  { key: "kana",     label: "五十音" },
  { key: "project",  label: "PJごと" },
];

export default function RepoCaList() {
  const { allRepoCas, removeRepoCa, updateRepoCa } = useRepoCa();
  const { projects } = useProjects();
  const [mainTab, setMainTab]           = useState<"repoca" | "projects">("repoca");
  const [filter, setFilter]             = useState<"all" | "favorite" | "incomplete" | "completed">("all");
  const [search, setSearch]             = useState("");
  const [selectedRc, setSelectedRc]     = useState<RepoCa | null>(null);
  const [sortBy, setSortBy]             = useState<SortKey>("created");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [editingRc, setEditingRc]         = useState<RepoCa | null>(null);
  const [editTab, setEditTab]             = useState<"開発" | "その他">("開発");
  const [editDraft, setEditDraft]         = useState<{ projectId: string; label: TaskLabel; implScope: ImplScope; content: string; isFavorite: boolean }>({
    projectId: "", label: "新規作成", implScope: "フロント", content: "", isFavorite: false,
  });

  const openEdit = (rc: RepoCa) => {
    setEditingRc(rc);
    const tab = (rc.taskType === "開発" || rc.taskType === "実装") ? "開発" : "その他";
    setEditTab(tab);
    setEditDraft({ projectId: rc.projectId, label: rc.label as TaskLabel, implScope: rc.implScope as ImplScope, content: rc.content, isFavorite: rc.isFavorite });
  };

  const saveEdit = () => {
    if (!editingRc) return;
    updateRepoCa(editingRc.id, {
      ...editDraft,
      taskType: editTab === "開発" ? "開発" : "その他",
      xp: editTab === "開発" ? 50 : 20,
    });
    setEditingRc(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => removeRepoCa(id));
    exitSelectionMode();
    setShowBulkConfirm(false);
  };

  const filtered = allRepoCas
    .filter((rc) => {
      const proj = projects.find((p) => p.id === rc.projectId);
      const matchSearch =
        search === "" ||
        rc.content.toLowerCase().includes(search.toLowerCase()) ||
        (proj?.name ?? "").includes(search);
      const matchFilter =
        filter === "all" ||
        (filter === "favorite"   && rc.isFavorite) ||
        (filter === "completed"  && rc.isCompleted) ||
        (filter === "incomplete" && !rc.isCompleted);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      // 常に未完了を先頭に
      const completedDiff = Number(a.isCompleted) - Number(b.isCompleted);
      if (sortBy === "kana") {
        const diff = a.content.localeCompare(b.content, "ja");
        return completedDiff !== 0 ? completedDiff : diff;
      }
      if (sortBy === "project") {
        const pa = projects.find((p) => p.id === a.projectId)?.name ?? "";
        const pb = projects.find((p) => p.id === b.projectId)?.name ?? "";
        const diff = pa.localeCompare(pb, "ja");
        return completedDiff !== 0 ? completedDiff : diff;
      }
      if (sortBy === "created") {
        const diff = b.createdAt.localeCompare(a.createdAt);
        return completedDiff !== 0 ? completedDiff : diff;
      }
      return completedDiff;
    });

  const stats = [
    { label: "作成済み", value: allRepoCas.length,                               Icon: HiCollection,  color: "#007aff" },
    { label: "完了",     value: allRepoCas.filter((r) => r.isCompleted).length,  Icon: HiCheckCircle, color: "#10b981" },
    { label: "総XP",    value: `${allRepoCas.reduce((s, r) => s + r.xp, 0)}XP`, Icon: HiStar,        color: "#f59e0b" },
  ];

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
        background: "#007aff", color: "white",
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 5 }}>
          <HiCollection style={{ width: 18, height: 18 }} /> RepoCa
        </span>
        {/* 検索バー（RepoCaタブのみ・右寄せ） */}
        {mainTab === "repoca" && (
          <div style={{ marginLeft: "auto" }}>
            <div style={{
              width: 148,
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px",
            }}>
              <HiSearch style={{ width: 14, height: 14, flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="検索..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: 14 }}
              />
            </div>
          </div>
        )}
      </header>

      {/* メインタブ切り替え */}
      <div style={{
        flexShrink: 0, display: "flex",
        background: "white", borderBottom: "2px solid #e5e7eb",
      }}>
        {(["repoca", "projects"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            style={{
              flex: 1, padding: "10px 0",
              border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: mainTab === tab ? 700 : 500,
              color: mainTab === tab ? "#007aff" : "#6b7280",
              borderBottom: `2px solid ${mainTab === tab ? "#007aff" : "transparent"}`,
              marginBottom: -2,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            }}
          >
            {tab === "repoca" ? (
              <><HiCollection style={{ width: 14, height: 14 }} /> RepoCa</>
            ) : (
              <><HiViewGrid style={{ width: 14, height: 14 }} /> プロジェクト</>
            )}
          </button>
        ))}
      </div>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 8, gap: 8, overflow: "hidden" }}>
        {mainTab === "repoca" ? (
          <>
            {/* 選択モード時: 一括操作バー */}
            {selectionMode && (
              <div style={{
                flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
                padding: "6px 8px", background: "#fef2f2", borderRadius: 8,
                border: "1px solid #fecaca",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", flex: 1 }}>
                  {selectedIds.size > 0 ? `${selectedIds.size}件を選択中` : "削除するRepoCaを選択してください"}
                </span>
                <button
                  onClick={() => {
                    if (selectedIds.size === filtered.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(filtered.map((r) => r.id)));
                    }
                  }}
                  style={{
                    background: "none", border: "1px solid #fca5a5", borderRadius: 6,
                    fontSize: 12, fontWeight: 600, color: "#dc2626", padding: "3px 8px", cursor: "pointer",
                  }}
                >
                  {selectedIds.size === filtered.length && filtered.length > 0 ? "全解除" : "全選択"}
                </button>
                <button
                  disabled={selectedIds.size === 0}
                  onClick={() => setShowBulkConfirm(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: selectedIds.size > 0 ? "#ef4444" : "#d1d5db",
                    border: "none", borderRadius: 6, padding: "4px 10px",
                    fontSize: 13, fontWeight: 700, color: "white",
                    cursor: selectedIds.size > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  <HiTrash style={{ width: 13, height: 13 }} /> 削除
                </button>
              </div>
            )}

            {/* カードリスト + 右サイドコントロール */}
            <div style={{ flex: 1, display: "flex", gap: 12, overflow: "hidden" }}>

              {/* カードリスト */}
              <div className="scroll-y" style={{ flex: 1 }}>
                {/* 新規作成エリア */}
                <Link
                  href="/repoca/new"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 10, marginBottom: 6, borderRadius: 10,
                    minHeight: 90,
                    border: "2px dashed #b8c9e7", background: "#f9fafb",
                    color: "#9ca3af", fontWeight: 600, fontSize: 14,
                    textDecoration: "none", cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#007aff"; (e.currentTarget as HTMLElement).style.color = "#007aff"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#b8c9e7"; (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
                >
                  + 新規作成
                </Link>
                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🃏</div>
                    <p style={{ fontSize: 14 }}>RepoCaが見つかりませんでした</p>
                  </div>
                ) : (
                  filtered.map((rc) => (
                    <RepoCaCard
                      key={rc.id}
                      rc={rc}
                      onClick={() => selectionMode ? toggleSelect(rc.id) : setSelectedRc(rc)}
                      selectionMode={selectionMode}
                      isSelected={selectedIds.has(rc.id)}
                      onEdit={() => openEdit(rc)}
                      onDelete={() => removeRepoCa(rc.id)}
                    />
                  ))
                )}
              </div>

              {/* 右サイドコントロール */}
              <div style={{ width: 210, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4 }}>
                {/* フィルター */}
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      width: "100%", padding: "7px 6px", borderRadius: 8,
                      border: filter === f.key ? "1.5px solid #007aff" : "1.5px solid #d1d5db",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: filter === f.key ? "#007aff" : "white",
                      color: filter === f.key ? "white" : "#6b7280",
                      transition: "all 0.15s",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
                {/* 区切り */}
                <div style={{ borderTop: "1px solid #e5e7eb", margin: "2px 0" }} />
                {/* ソート */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  style={{
                    width: "100%", padding: "7px 4px", borderRadius: 8,
                    border: "1.5px solid #d1d5db", fontSize: 13, fontWeight: 600,
                    color: "#374151", background: "white", cursor: "pointer",
                    textAlign: "center", textAlignLast: "center",
                  }}
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
                {/* 選択 */}
                <button
                  onClick={selectionMode ? exitSelectionMode : () => setSelectionMode(true)}
                  style={{
                    width: "100%", padding: "7px 6px", borderRadius: 8, cursor: "pointer",
                    border: selectionMode ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
                    background: selectionMode ? "#fef2f2" : "white",
                    color: selectionMode ? "#ef4444" : "#6b7280",
                    fontSize: 13, fontWeight: 700,
                  }}
                >
                  {selectionMode ? "キャンセル" : "選択"}
                </button>
              </div>

            </div>{/* end カードリスト + 右サイド */}
          </>
        ) : (
          <ProjectsContent />
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedRc && (
        <RepoCaDetailModal
          rc={selectedRc}
          onClose={() => setSelectedRc(null)}
          onDelete={(id) => { removeRepoCa(id); setSelectedRc(null); }}
        />
      )}

      {/* 編集モーダル */}
      {editingRc && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setEditingRc(null)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 360, maxWidth: "92vw", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "#007aff", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {(["開発", "その他"] as const).map((t) => (
                  <button key={t} onClick={() => {
                    setEditTab(t);
                    setEditDraft((d) => ({ ...d, label: t === "開発" ? "新規作成" : "調査" }));
                  }}
                    style={{
                      padding: "2px 10px", borderRadius: 99, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      background: editTab === t ? "white" : "rgba(255,255,255,0.25)",
                      color: editTab === t ? "#007aff" : "white",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => setEditingRc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => setEditDraft((d) => ({ ...d, isFavorite: !d.isFavorite }))}
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 14, padding: 0 }}>
                <span style={{ fontSize: 16, color: editDraft.isFavorite ? "#f59e0b" : "#d1d5db" }}>{editDraft.isFavorite ? "★" : "☆"}</span>
                <span style={{ color: editDraft.isFavorite ? "#d97706" : "#9ca3af", fontWeight: 600 }}>お気に入り</span>
              </button>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>PJ名 <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={editDraft.projectId} onChange={(e) => setEditDraft((d) => ({ ...d, projectId: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, color: "#374151" }}>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>ラベル <span style={{ color: "#ef4444" }}>*</span></label>
                <select value={editDraft.label} onChange={(e) => setEditDraft((d) => ({ ...d, label: e.target.value as TaskLabel }))}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, color: "#374151" }}>
                  {(editTab === "開発"
                    ? ["新規作成", "修正", "調査", "レビュー", "その他"]
                    : ["調査", "MTG", "外部対応", "その他"]
                  ).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              {editTab === "開発" && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>実装範囲 <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={editDraft.implScope} onChange={(e) => setEditDraft((d) => ({ ...d, implScope: e.target.value as ImplScope }))}
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, color: "#374151" }}>
                    {(["フロント", "バック", "インフラ", "フルスタック", "その他"] as ImplScope[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 3 }}>タスク内容 <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea
                  value={editDraft.content}
                  onChange={(e) => setEditDraft((d) => ({ ...d, content: e.target.value }))}
                  rows={3}
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 8px", fontSize: 14, resize: "none", color: "#374151", boxSizing: "border-box" }}
                />
              </div>
            </div>
            <div style={{ padding: "10px 18px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingRc(null)}>キャンセル</button>
              <button className="btn btn-primary" style={{ flex: 2 }}
                disabled={!editDraft.projectId || !editDraft.content.trim() || (editTab === "開発" && !editDraft.implScope)}
                onClick={saveEdit}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 一括削除確認モーダル */}
      {showBulkConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowBulkConfirm(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, width: 320, maxWidth: "90vw", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", padding: "16px 20px" }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0 }}>まとめて削除</p>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <p style={{ fontSize: 14, color: "#374151", margin: "0 0 4px" }}>
                選択した <span style={{ fontWeight: 800, color: "#ef4444" }}>{selectedIds.size}件</span> のRepoCaを削除します。
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>この操作は取り消せません。</p>
            </div>
            <div style={{ padding: "0 20px 16px", display: "flex", gap: 8 }}>
              <button
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => setShowBulkConfirm(false)}
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  flex: 2, padding: "10px 0", borderRadius: 10, border: "none",
                  background: "#ef4444", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                <HiTrash style={{ width: 15, height: 15 }} /> 削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- RepoCaカード ----
function RepoCaCard({ rc, onClick, selectionMode, isSelected, onEdit, onDelete }: {
  rc: RepoCa;
  onClick: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { projects } = useProjects();
  const proj = projects.find((p) => p.id === rc.projectId);
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: 10, marginBottom: 6,
        display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer",
        opacity: rc.isCompleted && !selectionMode ? 0.55 : 1,
        background: isSelected ? "#fef2f2" : rc.isCompleted ? "#f9fafb" : "white",
        outline: isSelected ? "2px solid #ef4444" : "none",
      }}
    >
      {/* 選択モード時チェックボックス */}
      {selectionMode && (
        <div style={{
          width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 2,
          border: isSelected ? "none" : "2px solid #d1d5db",
          background: isSelected ? "#ef4444" : "white",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isSelected && <HiCheck style={{ width: 13, height: 13, color: "white" }} />}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* タグ */}
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>{TASK_ICON[rc.taskType] ?? "📌"}</span>
          <span className="chip chip-indigo" style={{ fontSize: 14, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
            {proj?.name}
          </span>
          <span className="chip" style={{ fontSize: 14, background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
            {rc.implScope}
          </span>
          {rc.isFavorite && <span style={{ fontSize: 14 }}>⭐</span>}
        </div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#1f2937", margin: 0 }}>{rc.content}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
          <span className="chip chip-gray" style={{ fontSize: 14 }}>{rc.label}</span>
          <span style={{ fontSize: 14, color: "#007aff", fontWeight: 700, marginLeft: "auto" }}>+{rc.xp} XP</span>
        </div>
      </div>
      {!selectionMode && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#6b7280", display: "flex", alignItems: "center" }}
          >
            <HiPencilAlt style={{ width: 14, height: 14 }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444", display: "flex", alignItems: "center" }}
          >
            <HiTrash style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---- プロジェクトタブコンテンツ ----
function ProjectsContent() {
  const { projects } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const effectiveId = selectedId ?? projects[0]?.id ?? null;
  const selected    = projects.find((p) => p.id === effectiveId);
  const detail      = effectiveId ? PROJECT_DETAILS[effectiveId] : null;

  const memberGroups = detail ? [
    { role: "PM",          members: detail.memberList.filter((m) => m.role === "PM") },
    { role: "ディレクター", members: detail.memberList.filter((m) => m.role === "ディレクター") },
    { role: "デザイナー",   members: detail.memberList.filter((m) => m.role === "デザイナー") },
    { role: "エンジニア",   members: detail.memberList.filter((m) => !["PM", "ディレクター", "デザイナー"].includes(m.role)) },
  ].filter((g) => g.members.length > 0) : [];

  if (projects.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div>
          <p style={{ fontSize: 14 }}>プロジェクトがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: "flex", overflow: "hidden",
      border: "1px solid #e5e7eb", borderRadius: 10, background: "white",
    }}>
      {/* 左: プロジェクトリスト */}
      <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
        {projects.map((project) => {
          const d          = PROJECT_DETAILS[project.id];
          const isSelected = effectiveId === project.id;
          return (
            <div
              key={project.id}
              onClick={() => setSelectedId(project.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: isSelected ? "13px 14px" : "11px 14px",
                borderBottom: "1px solid #f3f4f6",
                cursor: "pointer",
                background: isSelected ? "#e8f2ff" : "white",
                transition: "background 0.1s",
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: project.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                {project.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: isSelected ? 13 : 12,
                  color: "#1a1a2e", marginBottom: 2, lineHeight: 1.3,
                }}>
                  {project.name}
                </div>
                {d && (
                  <div style={{ fontSize: 14, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.techStack.split(",").slice(0, 2).join(",")}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 14, color: "#9ca3af", flexShrink: 0 }}>›</span>
            </div>
          );
        })}
      </div>

      {/* 右: プロジェクト詳細 */}
      {selected && detail && (
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
          {/* 概要 */}
          <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>概要</div>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>{detail.description}</p>
          </div>

          {/* メンバー */}
          <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, marginBottom: 8 }}>メンバー</div>
            {/* 役割別サマリー */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              {memberGroups.map((g) => (
                <span key={g.role} style={{
                  fontSize: 14, fontWeight: 600,
                  background: "#f3f4f6", color: "#374151",
                  borderRadius: 99, padding: "2px 8px",
                }}>
                  {g.role}：{g.members.length}名
                </span>
              ))}
            </div>
            {/* 名前一覧 */}
            <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #f3f4f6" }}>
              {detail.memberList.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 10px",
                    borderBottom: i < detail.memberList.length - 1 ? "1px solid #f3f4f6" : "none",
                    background: m.name.includes("自分") ? "#e8f2ff" : "white",
                    fontSize: 14,
                  }}
                >
                  <span style={{
                    color: "#1a1a2e", fontWeight: m.name.includes("自分") ? 700 : 400,
                  }}>
                    {m.name}
                  </span>
                  <span style={{
                    color: m.name.includes("自分") ? "#007aff" : "#6b7280",
                    fontWeight: m.name.includes("自分") ? 700 : 400,
                    fontSize: 14,
                  }}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 主な仕様技術 */}
          <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, marginBottom: 5 }}>主な仕様技術</div>
            <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, wordBreak: "break-word" }}>
              {detail.techStack}
            </div>
          </div>

          {/* 役割 */}
          <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>役割</div>
            <div style={{ fontSize: 14, color: "#374151" }}>{detail.role}</div>
          </div>

          {/* 業務内容 */}
          <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>業務内容</div>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>{detail.workContent}</p>
          </div>

          {/* アサイン日 */}
          <div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 5, fontWeight: 600 }}>アサイン日</div>
            <div style={{ fontSize: 14, color: "#374151" }}>{detail.assignedDate}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- RepoCa詳細モーダル ----
function RepoCaDetailModal({ rc, onClose, onDelete }: { rc: RepoCa; onClose: () => void; onDelete: (id: string) => void }) {
  const { projects } = useProjects();
  const proj = projects.find((p) => p.id === rc.projectId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rows: { label: string; value: string }[] = [
    { label: "プロジェクト", value: proj?.name ?? "—" },
    { label: "タスク種別",   value: `${TASK_ICON[rc.taskType] ?? "📌"} ${rc.taskType}` },
    { label: "ラベル",       value: rc.label },
    { label: "実装スコープ", value: rc.implScope },
    { label: "工数",         value: rc.duration > 0 ? fmtDuration(rc.duration) : "未記入" },
    { label: "獲得XP",       value: `+${rc.xp} XP` },
    { label: "作成日",       value: rc.createdAt.slice(0, 10) },
    { label: "ステータス",   value: rc.isCompleted ? "✓ 完了" : "未完了" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)", zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white", borderRadius: 16, width: 340, maxWidth: "92vw",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          background: "#007aff",
          padding: "16px 20px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
              {proj && (
                <span style={{
                  fontSize: 14, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: proj.color, color: proj.textColor,
                }}>
                  {proj.icon} {proj.name}
                </span>
              )}
              <span style={{
                fontSize: 14, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                background: "rgba(255,255,255,0.25)", color: "white",
              }}>
                {rc.taskType}
              </span>
              {rc.isFavorite && <span style={{ fontSize: 14 }}>⭐</span>}
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.4 }}>
              {rc.content}
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.25)", borderRadius: 8,
            padding: "4px 10px", textAlign: "center", flexShrink: 0,
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>+{rc.xp}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>XP</div>
          </div>
        </div>

        {/* 詳細テーブル */}
        <div style={{ padding: "14px 20px 10px" }}>
          {rows.map((r) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14,
            }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
              <span style={{
                color: r.label === "ステータス" ? (rc.isCompleted ? "#10b981" : "#9ca3af") :
                       r.label === "獲得XP"     ? "#007aff" : "#1f2937",
                fontWeight: r.label === "獲得XP" ? 700 : 500,
              }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div style={{ padding: "8px 20px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          {confirmDelete ? (
            <div style={{ background: "#fef2f2", borderRadius: 10, padding: "10px 12px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#991b1b", margin: "0 0 8px", textAlign: "center" }}>
                本当に削除しますか？
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                    background: "#f3f4f6", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#374151",
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={() => onDelete(rc.id)}
                  style={{
                    flex: 2, padding: "8px 0", borderRadius: 8, border: "none",
                    background: "#ef4444", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "white",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  <HiTrash style={{ width: 14, height: 14 }} /> 削除する
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: "10px 14px", borderRadius: 10, border: "none",
                  background: "#fef2f2", color: "#ef4444",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <HiTrash style={{ width: 15, height: 15 }} />
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: "none", background: "#f3f4f6",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151",
                }}
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
