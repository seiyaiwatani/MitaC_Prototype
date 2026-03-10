"use client";

import { useState } from "react";
import Link from "next/link";
import { RepoCa } from "@/types";
import { fmtDuration } from "@/lib/utils";
import { HiCollection, HiSearch, HiCheckCircle, HiStar, HiViewGrid } from "react-icons/hi";
import { useRepoCa } from "@/contexts/RepoCaContext";
import { useProjects } from "@/contexts/ProjectContext";

const SCOPE_COLOR: Record<string, string> = {
  フロント: "#4f46e5", バック: "#10b981", インフラ: "#f59e0b",
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

export default function RepoCaList() {
  const { allRepoCas } = useRepoCa();
  const { projects } = useProjects();
  const [mainTab, setMainTab]           = useState<"repoca" | "projects">("repoca");
  const [filter, setFilter]             = useState<"all" | "favorite" | "incomplete" | "completed">("all");
  const [search, setSearch]             = useState("");
  const [selectedRc, setSelectedRc]     = useState<RepoCa | null>(null);

  const filtered = allRepoCas.filter((rc) => {
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
  });

  const stats = [
    { label: "作成済み", value: allRepoCas.length,                               Icon: HiCollection,  color: "#4f46e5" },
    { label: "完了",     value: allRepoCas.filter((r) => r.isCompleted).length,  Icon: HiCheckCircle, color: "#10b981" },
    { label: "総XP",    value: `${allRepoCas.reduce((s, r) => s + r.xp, 0)}XP`, Icon: HiStar,        color: "#f59e0b" },
  ];

  return (
    <div className="page-root">
      {/* ヘッダー */}
      <header style={{
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center", padding: "0 12px", gap: 8,
        background: "linear-gradient(90deg,#10b981,#059669)", color: "white",
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", gap: 5 }}>
          <HiCollection style={{ width: 18, height: 18 }} /> RepoCa
        </span>
        {/* 検索バー（RepoCaタブのみ・右寄せ・幅固定） */}
        {mainTab === "repoca" && (
          <div style={{
            marginLeft: "auto", width: 148,
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 10px",
          }}>
            <HiSearch style={{ width: 14, height: 14, flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="検索..."
              style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: 12 }}
            />
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
              fontSize: 13, fontWeight: mainTab === tab ? 700 : 500,
              color: mainTab === tab ? "#10b981" : "#6b7280",
              borderBottom: `2px solid ${mainTab === tab ? "#10b981" : "transparent"}`,
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
      <div className="page-body" style={{ flexDirection: "column", padding: 8, gap: 8 }}>
        {mainTab === "repoca" ? (
          <>
            {/* 統計 */}
            <div style={{ flexShrink: 0, display: "flex", gap: 6 }}>
              {stats.map((s) => (
                <div key={s.label} className="card" style={{ flex: 1, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <s.Icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* フィルター */}
            <div style={{ flexShrink: 0, display: "flex", gap: 4 }}>
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    flex: 1, padding: "5px 2px", borderRadius: 20,
                    border: filter === f.key ? "1.5px solid #10b981" : "1.5px solid #d1d5db",
                    fontSize: 10, fontWeight: 600, cursor: "pointer",
                    background: filter === f.key ? "#10b981" : "white",
                    color: filter === f.key ? "white" : "#6b7280",
                    boxShadow: filter === f.key
                      ? "0 2px 6px rgba(16,185,129,0.35)"
                      : "0 1px 3px rgba(0,0,0,0.08)",
                    transition: "all 0.15s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* カードリスト */}
            <div className="scroll-y" style={{ flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🃏</div>
                  <p style={{ fontSize: 13 }}>RepoCaが見つかりませんでした</p>
                </div>
              ) : (
                filtered.map((rc) => (
                  <RepoCaCard key={rc.id} rc={rc} onClick={() => setSelectedRc(rc)} />
                ))
              )}
            </div>
          </>
        ) : (
          <ProjectsContent />
        )}
      </div>

      {/* フローティング作成ボタン（RepoCaタブのみ） */}
      {mainTab === "repoca" && (
        <Link href="/repoca/new" style={{
          position: "fixed", right: 20, bottom: 24,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#10b981,#059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(16,185,129,0.5)",
          textDecoration: "none", fontSize: 28, color: "white",
          zIndex: 100,
        }}>
          +
        </Link>
      )}

      {/* 詳細モーダル */}
      {selectedRc && (
        <RepoCaDetailModal rc={selectedRc} onClose={() => setSelectedRc(null)} />
      )}
    </div>
  );
}

// ---- RepoCaカード ----
function RepoCaCard({ rc, onClick }: { rc: RepoCa; onClick: () => void }) {
  const { projects } = useProjects();
  const proj = projects.find((p) => p.id === rc.projectId);
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: 10, marginBottom: 6,
        display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer",
        // 完了済みグレーアウト
        opacity: rc.isCompleted ? 0.55 : 1,
        background: rc.isCompleted ? "#f9fafb" : "white",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* タグ */}
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontSize: 12 }}>{TASK_ICON[rc.taskType] ?? "📌"}</span>
          <span className="chip chip-indigo" style={{ fontSize: 10, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>
            {proj?.name}
          </span>
          <span className="chip" style={{ fontSize: 10, background: SCOPE_COLOR[rc.implScope] + "22", color: SCOPE_COLOR[rc.implScope] }}>
            {rc.implScope}
          </span>
          {rc.isFavorite && <span style={{ fontSize: 10 }}>⭐</span>}
        </div>
        <p style={{ fontSize: 12, fontWeight: 500, color: "#1f2937", margin: 0 }}>{rc.content}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
          <span className="chip chip-gray" style={{ fontSize: 9 }}>{rc.label}</span>
          {rc.duration > 0 && (
            <span style={{ fontSize: 9, color: "#6b7280" }}>{fmtDuration(rc.duration)}</span>
          )}
          <span style={{ fontSize: 10, color: "#4f46e5", fontWeight: 700, marginLeft: "auto" }}>+{rc.xp} XP</span>
        </div>
      </div>
    </div>
  );
}

// ---- プロジェクトタブコンテンツ ----
function ProjectsContent() {
  const { projects } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((p) => p.id === selectedId);
  const detail = selectedId ? PROJECT_DETAILS[selectedId] : null;

  return (
    <>
      <div className="scroll-y" style={{ flex: 1 }}>
        {projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🐾</div>
            <p style={{ fontSize: 13 }}>プロジェクトがありません</p>
          </div>
        ) : (
          projects.map((project) => {
            const d = PROJECT_DETAILS[project.id];
            return (
              <div
                key={project.id}
                className="card"
                onClick={() => setSelectedId(project.id)}
                style={{
                  padding: "12px 14px", marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: project.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>
                  {project.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", marginBottom: 2 }}>
                    {project.name}
                  </div>
                  {d && (
                    <div style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {d.techStack.split(",").slice(0, 3).join(",")}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 18, color: "#9ca3af", flexShrink: 0 }}>›</span>
              </div>
            );
          })
        )}
      </div>
      {selected && detail && (
        <ProjectDetailModal project={selected} detail={detail} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}

// ---- プロジェクト詳細モーダル ----
type ProjectType = { id: string; name: string; icon: string; color: string; textColor: string };

function ProjectDetailModal({
  project, detail, onClose,
}: {
  project: ProjectType;
  detail: ProjectDetail;
  onClose: () => void;
}) {
  const pm       = detail.memberList.filter((m) => m.role === "PM");
  const director = detail.memberList.filter((m) => m.role === "ディレクター");
  const designer = detail.memberList.filter((m) => m.role === "デザイナー");
  const engineer = detail.memberList.filter((m) => !["PM", "ディレクター", "デザイナー"].includes(m.role));

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
          maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          background: project.color, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>
            {project.icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: project.textColor }}>{project.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{detail.role}</div>
          </div>
        </div>

        {/* 詳細スクロール */}
        <div style={{ overflowY: "auto", padding: "14px 20px 10px" }}>
          {/* 概要 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>概要</div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginBottom: 12 }}>{detail.description}</div>

          {/* 技術スタック */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>主な使用技術</div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, marginBottom: 12 }}>{detail.techStack}</div>

          {/* メンバー数 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>メンバー</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            {pm.length > 0       && <span style={{ fontSize: 11, color: "#6b7280" }}>PM：{pm.length}名</span>}
            {director.length > 0 && <span style={{ fontSize: 11, color: "#6b7280" }}>ディレクター：{director.length}名</span>}
            {designer.length > 0 && <span style={{ fontSize: 11, color: "#6b7280" }}>デザイナー：{designer.length}名</span>}
            {engineer.length > 0 && <span style={{ fontSize: 11, color: "#6b7280" }}>エンジニア：{engineer.length}名</span>}
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
            {detail.memberList.map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "4px 0", borderBottom: i < detail.memberList.length - 1 ? "1px solid #e5e7eb" : "none",
                fontSize: 12,
              }}>
                <span style={{ color: "#374151" }}>{m.name}</span>
                <span style={{ color: "#6b7280" }}>{m.role}</span>
              </div>
            ))}
          </div>

          {/* アサイン日 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>アサイン日</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{detail.assignedDate}</div>
        </div>

        {/* フッター */}
        <div style={{ padding: "8px 20px 18px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 10,
              border: "none", background: "#f3f4f6",
              fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#374151",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- RepoCa詳細モーダル ----
function RepoCaDetailModal({ rc, onClose }: { rc: RepoCa; onClose: () => void }) {
  const { projects } = useProjects();
  const proj = projects.find((p) => p.id === rc.projectId);
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
          background: "linear-gradient(135deg,#10b981,#059669)",
          padding: "16px 20px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
              {proj && (
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                  background: proj.color, color: proj.textColor,
                }}>
                  {proj.icon} {proj.name}
                </span>
              )}
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                background: "rgba(255,255,255,0.25)", color: "white",
              }}>
                {rc.taskType}
              </span>
              {rc.isFavorite && <span style={{ fontSize: 12 }}>⭐</span>}
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
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>XP</div>
          </div>
        </div>

        {/* 詳細テーブル */}
        <div style={{ padding: "14px 20px 10px" }}>
          {rows.map((r) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: 12,
            }}>
              <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
              <span style={{
                color: r.label === "ステータス" ? (rc.isCompleted ? "#10b981" : "#9ca3af") :
                       r.label === "獲得XP"     ? "#4f46e5" : "#1f2937",
                fontWeight: r.label === "獲得XP" ? 700 : 500,
              }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div style={{ padding: "8px 20px 18px" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 10,
              border: "none", background: "#f3f4f6",
              fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#374151",
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
