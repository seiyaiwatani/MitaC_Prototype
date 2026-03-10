"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import Link from "next/link";

type Tab = "アカウント" | "フレックス" | "利用規約" | "外部連携" | "管理者ページ" | "その他";

const TABS: Tab[] = ["アカウント", "フレックス", "利用規約", "外部連携", "管理者ページ", "その他"];

function AccountTab() {
  const [startNotif, setStartNotif] = useState<"on" | "off">("on");
  const [overtimeNotif, setOvertimeNotif] = useState<"on" | "off">("on");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* アカウント情報 */}
      <div style={{
        background: "#e5e7eb", borderRadius: 8, height: 44,
      }} />

      {/* 通知設定 */}
      <div style={{
        background: "#e5e7eb", borderRadius: 8, padding: "14px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "#374151" }}>
          <span>始業通知</span>
          {(["on", "off"] as const).map((v) => (
            <label key={v} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input
                type="radio"
                name="startNotif"
                value={v}
                checked={startNotif === v}
                onChange={() => setStartNotif(v)}
                style={{ accentColor: "#4f46e5" }}
              />
              <span>{v === "on" ? "ON" : "OFF"}</span>
            </label>
          ))}
          <span style={{ marginLeft: 12 }}>残業通知</span>
          {(["on", "off"] as const).map((v) => (
            <label key={v} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
              <input
                type="radio"
                name="overtimeNotif"
                value={v}
                checked={overtimeNotif === v}
                onChange={() => setOvertimeNotif(v)}
                style={{ accentColor: "#4f46e5" }}
              />
              <span>{v === "on" ? "ON" : "OFF"}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ご意見フォーム */}
      <div style={{
        background: "#e5e7eb", borderRadius: 8, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>ご意見フォーム</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          URL：https://www.テキストテキストテキストテキストテキストテキスト.com
        </div>
      </div>

      {/* クレジット */}
      <div style={{
        background: "#e5e7eb", borderRadius: 8, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#374151" }}>クレジット</div>
        <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
          テキストテキストテキストテキストテキストテキスト
        </div>
      </div>
    </div>
  );
}

function FlexTab() {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#e5e7eb", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12 }}>
          フレックスタイム設定
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#374151" }}>
            <span style={{ width: 80 }}>始業時刻</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 13 }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, color: "#374151" }}>
            <span style={{ width: 80 }}>終業時刻</span>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 13 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TextTab({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ background: "#e5e7eb", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.8 }}>{content}</div>
    </div>
  );
}


function OtherTab() {
  return <TextTab title="その他" content="テキストテキストテキストテキストテキストテキスト" />;
}

function ExternalTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "#e5e7eb", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 8 }}>外部連携</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          テキストテキストテキストテキストテキストテキスト
        </div>
      </div>
    </div>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case "アカウント": return <AccountTab />;
    case "フレックス": return <FlexTab />;
    case "利用規約":
      return <TextTab title="利用規約" content={"テキストテキストテキストテキストテキストテキスト\nテキストテキストテキストテキストテキストテキスト\nテキストテキストテキストテキストテキストテキスト"} />;
    case "外部連携": return <ExternalTab />;
    case "その他": return <OtherTab />;
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("アカウント");
  const router = useRouter();

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/" style={{ color: "#1e1b4b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>設定</span>
        <div style={{ marginLeft: "auto", width: 20 }} />
      </div>

      {/* 2カラムボディ */}
      <div style={{
        flex: 1, overflow: "hidden",
        display: "grid", gridTemplateColumns: "140px 1fr", gap: 0,
      }}>
        {/* 左: タブリスト */}
        <div style={{
          background: "#f3f4f6",
          display: "flex", flexDirection: "column", gap: 2, padding: 8,
          overflowY: "auto",
        }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => tab === "管理者ページ" ? router.push("/admin") : setActiveTab(tab)}
              style={{
                padding: "12px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === tab ? 700 : 400,
                textAlign: "left",
                background: activeTab === tab ? "#d1d5db" : "transparent",
                color: activeTab === tab ? "#1a1a2e" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 右: コンテンツ */}
        <div style={{ overflowY: "auto", padding: 16 }}>
          <TabContent tab={activeTab} />
        </div>
      </div>
    </div>
  );
}
