"use client";

import { useState } from "react";

type Tab = "一般" | "勤務時間" | "利用規約" | "外部連携" | "その他";

const TABS: Tab[] = ["一般", "勤務時間", "利用規約", "外部連携", "その他"];

const NOTIF_MINUTES = [5, 10, 15, 30, 60];

function subtractMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m - minutes;
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60).toString().padStart(2, "0");
  const mm = (((total % 1440) + 1440) % 1440 % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

async function sendTestNotif(message: string) {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    new Notification("Mita=C", { body: message });
  }
}

function NotifRow({ label, name, value, onChange, baseTime, baseLabel, minutes, onMinutesChange, testMessage }: {
  label: string;
  name: string;
  value: "on" | "off";
  onChange: (v: "on" | "off") => void;
  baseTime: string;
  baseLabel: string;
  minutes: number;
  onMinutesChange: (v: number) => void;
  testMessage: string;
}) {
  const notifTime = subtractMinutes(baseTime, minutes);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 14, color: "#374151" }}>
        <span style={{ fontWeight: 600, minWidth: 60 }}>{label}</span>
        {(["on", "off"] as const).map((v) => (
          <label key={v} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <input
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              style={{ accentColor: "#007aff" }}
            />
            <span>{v === "on" ? "ON" : "OFF"}</span>
          </label>
        ))}
      </div>
      {value === "on" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", paddingLeft: 4 }}>
          <span>{baseLabel}（{baseTime}）の</span>
          <select
            value={minutes}
            onChange={(e) => onMinutesChange(Number(e.target.value))}
            style={{ fontSize: 13, border: "1px solid #9ca3af", borderRadius: 6, padding: "2px 6px", color: "#374151", background: "white" }}
          >
            {NOTIF_MINUTES.map((m) => (
              <option key={m} value={m}>{m}分</option>
            ))}
          </select>
          <span>前 {notifTime} に通知を出します</span>
          <button
            onClick={() => sendTestNotif(testMessage)}
            style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "1px solid #9ca3af", background: "white", color: "#374151", cursor: "pointer" }}
          >
            テスト
          </button>
        </div>
      )}
    </div>
  );
}

function AccountTab({ startTime, endTime }: { startTime: string; endTime: string }) {
  const [startNotif, setStartNotif] = useState<"on" | "off">("on");
  const [overtimeNotif, setOvertimeNotif] = useState<"on" | "off">("on");
  const [startMinutes, setStartMinutes] = useState(10);
  const [overtimeMinutes, setOvertimeMinutes] = useState(30);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 通知設定 */}
      <div style={{ background: "white", borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <NotifRow
          label="始業通知"
          name="startNotif"
          value={startNotif}
          onChange={setStartNotif}
          baseTime={startTime}
          baseLabel="始業時刻"
          minutes={startMinutes}
          onMinutesChange={setStartMinutes}
          testMessage="始業報告を行ってください"
        />
        <NotifRow
          label="残業通知"
          name="overtimeNotif"
          value={overtimeNotif}
          onChange={setOvertimeNotif}
          baseTime={endTime}
          baseLabel="終業時刻"
          minutes={overtimeMinutes}
          onMinutesChange={setOvertimeMinutes}
          testMessage="残業報告を行ってください"
        />
      </div>

      {/* ご意見フォーム */}
      <div style={{
        background: "white", borderRadius: 8, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>ご意見フォーム</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          URL：https://www.テキストテキストテキストテキストテキストテキスト.com
        </div>
      </div>

      {/* クレジット */}
      <div style={{
        background: "white", borderRadius: 8, padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151" }}>クレジット</div>
        <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
          テキストテキストテキストテキストテキストテキスト
        </div>
      </div>
    </div>
  );
}

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value.split(":").map(Number);
  const selectStyle = { fontSize: 14, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px", color: "#374151", background: "white" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <select value={h} onChange={(e) => onChange(`${e.target.value.padStart(2, "0")}:${m.toString().padStart(2, "0")}`)} style={selectStyle}>
        {Array.from({ length: 25 }, (_, i) => (
          <option key={i} value={i}>{i.toString().padStart(2, "0")}</option>
        ))}
      </select>
      <span style={{ color: "#374151" }}>:</span>
      <select value={m} onChange={(e) => onChange(`${h.toString().padStart(2, "0")}:${e.target.value.padStart(2, "0")}`)} style={selectStyle}>
        {[0, 15, 30, 45].map((i) => (
          <option key={i} value={i}>{i.toString().padStart(2, "0")}</option>
        ))}
      </select>
    </div>
  );
}

function FlexTab({ startTime, setStartTime, endTime, setEndTime }: {
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "white", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12 }}>
          勤務時間設定
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#374151" }}>
            <span style={{ width: 80 }}>始業時刻</span>
            <TimeSelect value={startTime} onChange={setStartTime} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#374151" }}>
            <span style={{ width: 80 }}>終業時刻</span>
            <TimeSelect value={endTime} onChange={setEndTime} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TextTab({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ background: "white", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8 }}>{content}</div>
    </div>
  );
}

function OtherTab() {
  return <TextTab title="その他" content="テキストテキストテキストテキストテキストテキスト" />;
}

function ExternalTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: "white", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 8 }}>外部連携</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          テキストテキストテキストテキストテキストテキスト
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("一般");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("19:00");

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>設定</span>
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
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
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
          {activeTab === "一般" && <AccountTab startTime={startTime} endTime={endTime} />}
          {activeTab === "勤務時間" && <FlexTab startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} />}
          {activeTab === "利用規約" && <TextTab title="利用規約" content={"テキストテキストテキストテキストテキストテキスト\nテキストテキストテキストテキストテキストテキスト\nテキストテキストテキストテキストテキストテキスト"} />}
          {activeTab === "外部連携" && <ExternalTab />}
          {activeTab === "その他" && <OtherTab />}
        </div>
      </div>
    </div>
  );
}
