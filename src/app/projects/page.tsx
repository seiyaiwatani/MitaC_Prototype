"use client";

import { useState } from "react";
import { projects, currentUser } from "@/lib/mock-data";

const assignedProjects = projects.filter((p) => p.teamId === currentUser.teamId);

type MemberEntry = { name: string; role: string };

type ProjectDetail = {
  description: string;
  memberList: MemberEntry[];
  techStack: string;
  role: string;
  workContent: string;
  assignedDate: string;
};

const projectDetails: Record<string, ProjectDetail> = {
  p1: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    memberList: [
      { name: "田中 一郎",   role: "PM" },
      { name: "佐藤 花子",   role: "ディレクター" },
      { name: "山田 太郎",   role: "デザイナー" },
      { name: "菊池（自分）", role: "フロントエンドエンジニア" },
      { name: "鈴木 次郎",   role: "バックエンドエンジニア" },
      { name: "伊藤 三郎",   role: "バックエンドエンジニア" },
    ],
    techStack: "Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, AWS, Docker",
    role: "フロントエンドエンジニア",
    workContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignedDate: "2026年2月9日〜",
  },
  p2: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    memberList: [
      { name: "高橋 四郎",   role: "PM" },
      { name: "渡辺 五郎",   role: "ディレクター" },
      { name: "中村 六子",   role: "ディレクター" },
      { name: "小林 七海",   role: "デザイナー" },
      { name: "加藤 八郎",   role: "デザイナー" },
      { name: "菊池（自分）", role: "フルスタックエンジニア" },
      { name: "吉田 九郎",   role: "フロントエンドエンジニア" },
      { name: "山本 十子",   role: "バックエンドエンジニア" },
      { name: "松本 十一郎", role: "バックエンドエンジニア" },
    ],
    techStack: "WordPress, PHP, MySQL, JavaScript",
    role: "フルスタックエンジニア",
    workContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignedDate: "2026年1月15日〜",
  },
  p4: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    memberList: [
      { name: "井上 十二郎", role: "PM" },
      { name: "木村 十三子", role: "デザイナー" },
      { name: "菊池（自分）", role: "バックエンドエンジニア" },
      { name: "林 十四郎",   role: "インフラエンジニア" },
    ],
    techStack: "AWS, Python, Redshift, Airflow, Terraform",
    role: "バックエンドエンジニア",
    workContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignedDate: "2026年3月1日〜",
  },
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6,
};

const SECTION_TEXT: React.CSSProperties = {
  fontSize: 14, color: "#6b7280", lineHeight: 1.7,
};

const DIVIDER: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb", margin: "12px 0",
};

// メンバー詳細：常時表示
function MemberSection({ memberList }: { memberList: MemberEntry[] }) {
  const pm       = memberList.filter((m) => m.role === "PM");
  const director = memberList.filter((m) => m.role === "ディレクター");
  const designer = memberList.filter((m) => m.role === "デザイナー");
  const engineer = memberList.filter((m) => !["PM", "ディレクター", "デザイナー"].includes(m.role));

  return (
    <div>
      <div style={SECTION_LABEL}>メンバー</div>
      {/* 人数サマリー */}
      <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
        {pm.length > 0       && <div style={SECTION_TEXT}>PM：{pm.length}名</div>}
        {director.length > 0 && <div style={SECTION_TEXT}>ディレクター：{director.length}名</div>}
        {designer.length > 0 && <div style={SECTION_TEXT}>デザイナー：{designer.length}名</div>}
        {engineer.length > 0 && <div style={SECTION_TEXT}>エンジニア：{engineer.length}名</div>}
      </div>
      {/* 詳細テーブル */}
      <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600, textAlign: "left", paddingBottom: 6, width: "50%" }}>名前</th>
              <th style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600, textAlign: "left", paddingBottom: 6 }}>役割</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((m, i) => (
              <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ fontSize: 14, color: "#374151", padding: "6px 0" }}>{m.name}</td>
                <td style={{ fontSize: 14, color: "#6b7280", padding: "6px 0" }}>{m.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TechStackSection({ techStack }: { techStack: string }) {
  return (
    <div>
      <div style={SECTION_LABEL}>主な仕様技術</div>
      <div style={{ ...SECTION_TEXT, whiteSpace: "normal", wordBreak: "break-word" }}>
        {techStack}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string>(assignedProjects[0]?.id ?? "");
  const selected = assignedProjects.find((p) => p.id === selectedId);
  const detail = selectedId ? projectDetails[selectedId] : null;

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader" style={{ gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          🐾
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>アサインされているプロジェクト一覧</span>
      </div>

      {/* 2カラムボディ */}
      <div style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "220px 1fr", borderTop: "1px solid #e5e7eb" }}>

        {/* 左: PJ一覧 */}
        <div style={{ background: "#f9fafb", borderRight: "1px solid #e5e7eb", overflowY: "auto" }}>
          {assignedProjects.map((project) => {
            const isActive = project.id === selectedId;
            return (
              <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 16px",
                  background: isActive ? "white" : "transparent",
                  border: "none", borderBottom: "1px solid #e5e7eb",
                  cursor: "pointer", textAlign: "left",
                  borderLeft: isActive ? "3px solid #007aff" : "3px solid transparent",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: project.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {project.icon}
                </div>
                <span style={{
                  flex: 1, fontSize: 14, fontWeight: isActive ? 700 : 400,
                  color: isActive ? "#1a1a2e" : "#374151",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {project.name}
                </span>
                <span style={{ fontSize: 16, color: "#9ca3af", flexShrink: 0 }}>›</span>
              </button>
            );
          })}
        </div>

        {/* 右: 詳細 */}
        <div style={{ overflowY: "auto", padding: 20 }}>
          {selected && detail ? (
            <div style={{ display: "flex", flexDirection: "column" }}>

              {/* 概要 */}
              <div>
                <div style={SECTION_LABEL}>概要</div>
                <div style={SECTION_TEXT}>{detail.description}</div>
              </div>

              <div style={DIVIDER} />

              {/* メンバー */}
              <MemberSection memberList={detail.memberList} />

              <div style={DIVIDER} />

              {/* 主な仕様技術 */}
              <TechStackSection key={selectedId} techStack={detail.techStack} />

              <div style={DIVIDER} />

              {/* 役割 */}
              <div>
                <div style={SECTION_LABEL}>役割</div>
                <div style={SECTION_TEXT}>{detail.role}</div>
              </div>

              <div style={DIVIDER} />

              {/* 業務内容 */}
              <div>
                <div style={SECTION_LABEL}>業務内容</div>
                <div style={SECTION_TEXT}>{detail.workContent}</div>
              </div>

              <div style={DIVIDER} />

              {/* アサイン日 */}
              <div>
                <div style={SECTION_LABEL}>アサイン日</div>
                <div style={SECTION_TEXT}>{detail.assignedDate}</div>
              </div>

            </div>
          ) : (
            <div style={{ color: "#9ca3af", fontSize: 14, textAlign: "center", marginTop: 40 }}>
              プロジェクトを選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
