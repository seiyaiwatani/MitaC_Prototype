"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser, repoCas, projects, missions, badges } from "@/lib/mock-data";
import { TaskLabel, ImplScope } from "@/types";
import Image from "next/image";
import {
  HiFlag, HiDotsVertical, HiCheck, HiBadgeCheck, HiClipboardList, HiStar,
  HiFolder,
} from "react-icons/hi";

const AVATAR_MAP: Record<string, string> = {
  fox:     "/avatars/avatar_fox.svg",
  cat:     "/avatars/avatar_cat.svg",
  doragon: "/avatars/avatar_doragon.svg",
};

const NEWS = [
  "新機能追加！バッジシートが追加されました",
  "1月10日にメンテナンスを実施します",
  "今月のTOPユーザーに特別ボーナスをプレゼント",
];

const MYPAGE_NAV = [
  { href: "/mypage",          label: "バッジ",       Icon: HiBadgeCheck,  color: "#10b981" },
  { href: "/mypage/rewards",  label: "報酬交換",     Icon: HiStar,        color: "#f59e0b" },
  { href: "/mypage/missions", label: "ミッション",   Icon: HiFlag,        color: "#4f46e5" },
  { href: "/admin",           label: "プロジェクト", Icon: HiFolder,      color: "#6366f1" },
];

type FilterType = "全て" | "未完了" | "完了";
type AttendanceState = "idle" | "departing" | "working" | "returning";

export default function Home() {
  const [projectId, setProjectId]     = useState(projects[0].id);
  const [label, setLabel]             = useState<TaskLabel>("新規作成");
  const [implScope, setImplScope]     = useState<ImplScope>("フロント");
  const [taskContent, setTaskContent] = useState("");
  const [attendance, setAttendance]   = useState<AttendanceState>("idle");

  const handleCheckIn = () => {
    if (attendance !== "idle") return;
    setAttendance("departing");
  };
  const handleCheckOut = () => {
    if (attendance !== "working") return;
    setAttendance("returning");
  };
  const handleAvatarAnimEnd = () => {
    if (attendance === "departing") setAttendance("working");
    else if (attendance === "returning") setAttendance("idle");
  };

  // タスク（本日のRepoCa）- ローカル状態でトグル可能に
  const [localRepoCas, setLocalRepoCas] = useState(
    repoCas.filter((r) => ["rc1","rc2","rc3","rc4","rc5"].includes(r.id))
  );
  const [taskFilter, setTaskFilter] = useState<FilterType>("全て");

  const toggleTask = (id: string) =>
    setLocalRepoCas((prev) => prev.map((r) => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));

  const filteredRepoCas = localRepoCas.filter((r) => {
    if (taskFilter === "未完了") return !r.isCompleted;
    if (taskFilter === "完了")   return r.isCompleted;
    return true;
  });

  const completedCount = localRepoCas.filter((r) => r.isCompleted).length;
  const dailyMissions  = missions.filter((m) => m.type === "daily");
  const acquiredBadges = badges.filter((b) => b.acquired).length;
  const xpPct          = Math.round((currentUser.xp / currentUser.xpToNext) * 100);
  const avatarSrc      = AVATAR_MAP[currentUser.avatar] ?? AVATAR_MAP.fox;

  return (
    <div className="page-root">

      {/* ニュースティッカー */}
      <div className="news-ticker">
        <span style={{ fontSize: 10, fontWeight: 700, color: "#4f46e5", flexShrink: 0 }}>お知らせ</span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="news-ticker-inner">
            {NEWS.concat(NEWS).map((n, i) => (
              <span key={i} style={{ marginRight: 40 }}>◇ {n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* クイックナビ */}
      <div style={{
        flexShrink: 0, background: "white", borderBottom: "1px solid #e5e7eb",
        display: "flex", padding: "6px 10px", gap: 20, overflowX: "auto",
      }}>
        {MYPAGE_NAV.map((item) => (
          <Link key={item.href} href={item.href} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "7px 22px", borderRadius: 99, textDecoration: "none",
            fontSize: 13, color: "#374151", fontWeight: 700, whiteSpace: "nowrap",
            background: "#f3f4f6", flexShrink: 0,
          }}>
            {item.label}
          </Link>
        ))}
      </div>

      {/* 3カラムメインエリア */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 340px 1fr", gap: 20, padding: 12, overflow: "hidden" }}>

        {/* ====== 左: 本日のタスク ====== */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ヘッダー */}
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>本日のタスク</span>
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
                {completedCount}/{localRepoCas.length} 完了
              </span>
            </div>
            {/* フィルタータブ */}
            <div style={{ display: "flex", gap: 4 }}>
              {(["全て", "未完了", "完了"] as FilterType[]).map((f) => (
                <button key={f} onClick={() => setTaskFilter(f)} style={{
                  padding: "2px 10px", borderRadius: 99, border: "none", fontSize: 10, fontWeight: 700,
                  cursor: "pointer",
                  background: taskFilter === f ? "#4f46e5" : "#f3f4f6",
                  color:      taskFilter === f ? "white"   : "#6b7280",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* タスクリスト */}
          <div className="scroll-y" style={{ flex: 1, padding: "4px 8px" }}>
            {localRepoCas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 8px", color: "#9ca3af" }}>
                <p style={{ fontSize: 11, marginBottom: 8 }}>本日の始業報告はされていません。</p>
                <Link href="/report/start">
                  <button className="btn btn-primary" style={{ fontSize: 11, padding: "5px 12px" }}>始業報告</button>
                </Link>
              </div>
            ) : filteredRepoCas.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 8px", color: "#9ca3af", fontSize: 11 }}>
                該当するタスクがありません
              </div>
            ) : (
              filteredRepoCas.map((rc) => {
                const proj = projects.find((p) => p.id === rc.projectId);
                return (
                  <div
                    key={rc.id}
                    onClick={() => toggleTask(rc.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 8,
                      padding: "7px 4px", borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      opacity: rc.isCompleted ? 0.6 : 1,
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      border: `2px solid ${rc.isCompleted ? "#10b981" : "#d1d5db"}`,
                      background: rc.isCompleted ? "#10b981" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "white",
                      transition: "all 0.15s",
                    }}>
                      {rc.isCompleted && <HiCheck style={{ width: 11, height: 11 }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 12, margin: 0, fontWeight: 500, lineHeight: 1.35,
                        color: rc.isCompleted ? "#9ca3af" : "#1f2937",
                        textDecoration: rc.isCompleted ? "line-through" : "none",
                      }}>
                        {rc.content}
                      </p>
                      <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
                        {proj && (
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 99,
                            background: proj.color, color: proj.textColor,
                          }}>
                            {proj.name}
                          </span>
                        )}
                        <span style={{ fontSize: 9, color: "#9ca3af" }}>{rc.label}</span>
                        {rc.duration > 0 && (
                          <span style={{ fontSize: 9, color: "#9ca3af" }}>{rc.duration}分</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: "#10b981", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                      +{rc.xp}XP
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* 今日のミッション */}
          <div style={{ padding: "6px 10px", borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#6b7280", marginBottom: 5 }}>
              <HiFlag style={{ width: 11, height: 11, color: "#4f46e5" }} />
              今日のミッション
            </div>
            {dailyMissions.map((m) => {
              const pct = Math.min(Math.round((m.progress / m.goal) * 100), 100);
              return (
                <div key={m.id} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{m.title}</span>
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>+{m.reward}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="xp-bar" style={{ flex: 1 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#10b981,#059669)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 9, color: "#9ca3af", whiteSpace: "nowrap" }}>{m.progress}/{m.goal}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ボタン */}
          <div style={{ padding: "6px 10px", display: "flex", gap: 6, flexShrink: 0 }}>
            <Link href="/report/start" style={{ flex: 1 }}>
              <button className="btn btn-primary" style={{ width: "100%", fontSize: 11, padding: "7px 4px" }}>始業報告</button>
            </Link>
            <Link href="/report/end" style={{ flex: 1 }}>
              <button className="btn" style={{ width: "100%", fontSize: 11, padding: "7px 4px", background: "#f59e0b", color: "white" }}>終業報告</button>
            </Link>
          </div>
        </div>

        {/* ====== 中央: ユーザーステータス ====== */}
        <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>

          {/* ゲームシーン */}
          {attendance !== "working" ? (
            /* ホームシーン (idle / departing / returning) */
            <div className="avatar-game-wrap" style={{ height: 160, flexShrink: 0 }}>
              <div style={{ position: "absolute", bottom: "33%", left: "5%",  fontSize: 28 }}>🌲</div>
              <div style={{ position: "absolute", bottom: "31%", left: "16%", fontSize: 22 }}>🌲</div>
              <div style={{ position: "absolute", bottom: "29%", left: "25%", fontSize: 16 }}>🌿</div>
              <div style={{ position: "absolute", bottom: "31%", right: "6%", fontSize: 40 }}>🏠</div>
              {/* アバター (中央揃えラッパー) */}
              <div style={{ position: "absolute", bottom: "30%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <div
                  className={
                    attendance === "departing" ? "avatar-depart" :
                    attendance === "returning" ? "avatar-return" :
                    "avatar-bob"
                  }
                  style={{ width: 80, height: 80 }}
                  onAnimationEnd={handleAvatarAnimEnd}
                >
                  <Image src={avatarSrc} alt="アバター" width={80} height={80}
                    style={{ imageRendering: "pixelated", objectFit: "contain", width: "100%", height: "100%" }} />
                </div>
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "#5a8a3c" }} />
              <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", background: "rgba(255,255,255,0.75)", padding: "2px 8px", borderRadius: 6 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontWeight: 800, fontSize: 12, color: "white", background: "#4f46e5", padding: "2px 10px", borderRadius: 99 }}>
                  Lv.{currentUser.level}
                </span>
              </div>
            </div>
          ) : (
            /* 冒険シーン (working) */
            <div className="avatar-game-wrap" style={{ height: 160, flexShrink: 0 }}>
              {/* スクロールする雲 */}
              <div style={{ position: "absolute", top: "6%", left: 0, right: 0, overflow: "hidden", height: 32 }}>
                <div style={{ display: "flex", gap: 120, animation: "scroll-left-loop 9s linear infinite", width: "max-content" }}>
                  {["⛅","⛅","⛅","⛅","⛅","⛅","⛅","⛅"].map((c, i) => (
                    <span key={i} style={{ fontSize: 20, flexShrink: 0 }}>{c}</span>
                  ))}
                </div>
              </div>
              {/* スクロールする木 */}
              <div style={{ position: "absolute", bottom: "28%", left: 0, right: 0, overflow: "hidden", height: 52 }}>
                <div style={{ display: "flex", gap: 70, alignItems: "flex-end", animation: "scroll-left-loop 3s linear infinite", width: "max-content" }}>
                  {["🌲","🌿","🌲","🌲","🌿","🌲","🌲","🌿","🌲","🌿","🌲","🌲","🌿","🌲","🌲","🌿"].map((t, i) => (
                    <span key={i} style={{ fontSize: 28, flexShrink: 0 }}>{t}</span>
                  ))}
                </div>
              </div>
              {/* 地面 */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "#5a8a3c" }} />
              {/* 歩くアバター */}
              <div style={{ position: "absolute", bottom: "30%", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <div className="avatar-walk" style={{ width: 80, height: 80 }}>
                  <Image src={avatarSrc} alt="アバター" width={80} height={80}
                    style={{ imageRendering: "pixelated", objectFit: "contain", width: "100%", height: "100%" }} />
                </div>
              </div>
              {/* 出勤中バッジ */}
              <div style={{ position: "absolute", top: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", background: "rgba(255,255,255,0.75)", padding: "2px 8px", borderRadius: 6 }}>
                  {currentUser.name}
                </span>
                <span style={{ fontWeight: 700, fontSize: 11, color: "white", background: "#10b981", padding: "2px 10px", borderRadius: 99 }}>
                  🏃 出勤中
                </span>
              </div>
            </div>
          )}

          {/* XPバー */}
          <div style={{ padding: "8px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280", marginBottom: 3 }}>
              <span style={{ fontWeight: 600 }}>EXP</span>
              <span>{currentUser.xp} / {currentUser.xpToNext}</span>
            </div>
            <div style={{ height: 7, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: "linear-gradient(90deg,#6366f1,#a855f7)", borderRadius: 4 }} />
            </div>
          </div>

          {/* ステータス3列 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
            {[
              { Icon: HiClipboardList, label: "本日タスク", value: `${completedCount}/${localRepoCas.length}`, color: "#4f46e5" },
              { Icon: HiBadgeCheck,    label: "バッジ",     value: `${acquiredBadges}個`,                      color: "#10b981" },
              { Icon: HiStar,         label: "コイン",     value: currentUser.currency.toLocaleString(),      color: "#f59e0b" },
            ].map(({ Icon, label, value, color }, i) => (
              <div key={label} style={{
                padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                borderRight: i < 2 ? "1px solid #e5e7eb" : "none",
              }}>
                <Icon style={{ width: 18, height: 18, color }} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>{value}</span>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* 本日のミッション進捗 */}
          <div style={{ padding: "12px 16px", flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>本日のミッション</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dailyMissions.map((m) => {
                const pct = Math.min(Math.round((m.progress / m.goal) * 100), 100);
                return (
                  <div key={m.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>{m.title}</span>
                      <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 10 }}>+{m.reward}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 7, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#10b981,#059669)", borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>{m.progress}/{m.goal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 出退勤ボタン */}
          <div style={{ padding: "14px 20px 16px", display: "flex", gap: 12, borderTop: "1px solid #e5e7eb", flexShrink: 0 }}>
            <button
              onClick={handleCheckIn}
              disabled={attendance !== "idle"}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 10, border: "none",
                background: attendance === "idle" ? "#fef9c3" : "#f3f4f6",
                color: attendance === "idle" ? "#78350f" : "#9ca3af",
                fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
                cursor: attendance === "idle" ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {attendance === "departing" ? "出発中…" : "出 勤"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={attendance !== "working"}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 10, border: "none",
                background: attendance === "working" ? "#dbeafe" : "#f3f4f6",
                color: attendance === "working" ? "#1e40af" : "#9ca3af",
                fontWeight: 800, fontSize: 15, letterSpacing: 0.5,
                cursor: attendance === "working" ? "pointer" : "not-allowed",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {attendance === "returning" ? "帰宅中…" : "退 勤"}
            </button>
          </div>
        </div>

        {/* ====== 右: RepoCa作成 + ショートカット ====== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>

          {/* RepoCa作成 */}
          <div className="card" style={{ padding: 12, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#1a1a2e" }}>RepoCa 作成</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 6px", fontSize: 11, color: "#374151" }}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <select value={label} onChange={(e) => setLabel(e.target.value as TaskLabel)}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 6px", fontSize: 11, color: "#374151" }}>
                  {(["新規作成", "修正", "調査", "レビュー"] as TaskLabel[]).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={implScope} onChange={(e) => setImplScope(e.target.value as ImplScope)}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 6px", fontSize: 11, color: "#374151" }}>
                  {(["フロント", "バック", "インフラ", "フルスタック", "その他"] as ImplScope[]).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <textarea value={taskContent} onChange={(e) => setTaskContent(e.target.value)} placeholder="タスク内容" rows={2}
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 6px", fontSize: 11, resize: "none", color: "#374151", boxSizing: "border-box" }} />
            </div>
            <Link href="/repoca/new">
              <button className="btn btn-primary" style={{ width: "100%", marginTop: 8, fontSize: 11, padding: "7px" }}>新規作成</button>
            </Link>
          </div>

          {/* ショートカット */}
          <div className="card" style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#1a1a2e", marginBottom: 10, flexShrink: 0 }}>ショートカット</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
              {MYPAGE_NAV.map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    height: "100%", minHeight: 90,
                    border: "1px solid #e5e7eb", borderRadius: 10,
                    padding: "16px 12px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 10,
                    background: "#fafafa", cursor: "pointer",
                  }}>
                    <item.Icon style={{ width: 30, height: 30, color: item.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
