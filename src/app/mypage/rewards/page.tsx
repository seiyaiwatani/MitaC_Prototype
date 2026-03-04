"use client";

import { useState } from "react";
import Link from "next/link";
import { currentUser } from "@/lib/mock-data";
import { HiArrowLeft, HiStar, HiCheck } from "react-icons/hi";

const REWARD_ITEMS = [
  { id: "r1", name: "Amazonギフト券 500円",    cost: 500,  icon: "🎁", category: "ギフト券",   stock: 10 },
  { id: "r2", name: "Amazonギフト券 1000円",   cost: 1000, icon: "🎁", category: "ギフト券",   stock: 5  },
  { id: "r3", name: "QUOカード 500円",          cost: 500,  icon: "💳", category: "ギフト券",   stock: 8  },
  { id: "r4", name: "コーヒーチケット",         cost: 200,  icon: "☕", category: "飲食",       stock: 20 },
  { id: "r5", name: "ランチチケット 1000円",    cost: 800,  icon: "🍱", category: "飲食",       stock: 10 },
  { id: "r6", name: "特別アバター衣装（王冠）", cost: 300,  icon: "👑", category: "アバター",   stock: 99 },
  { id: "r7", name: "レアバッジ枠",            cost: 150,  icon: "🏅", category: "アバター",   stock: 99 },
  { id: "r8", name: "半日有給チケット",         cost: 1500, icon: "📅", category: "特別特典",   stock: 3  },
];

const CATEGORIES = ["すべて", "ギフト券", "飲食", "アバター", "特別特典"] as const;
type Category = typeof CATEGORIES[number];

export default function RewardsPage() {
  const [category, setCategory]     = useState<Category>("すべて");
  const [exchanged, setExchanged]   = useState<string[]>([]);
  const [coins, setCoins]           = useState(currentUser.currency);
  const [confirmId, setConfirmId]   = useState<string | null>(null);

  const filtered = REWARD_ITEMS.filter(
    (item) => category === "すべて" || item.category === category
  );

  const handleExchange = (itemId: string) => {
    const item = REWARD_ITEMS.find((r) => r.id === itemId);
    if (!item || coins < item.cost) return;
    setCoins((c) => c - item.cost);
    setExchanged((prev) => [...prev, itemId]);
    setConfirmId(null);
  };

  return (
    <div className="page-root">
      {/* サブヘッダー */}
      <div className="page-subheader">
        <Link href="/" style={{ color: "#f59e0b", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <HiArrowLeft style={{ width: 20, height: 20 }} />
        </Link>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>報酬交換</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, background: "#fef9c3", padding: "3px 10px", borderRadius: 99 }}>
          <HiStar style={{ width: 14, height: 14, color: "#f59e0b" }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: "#78350f" }}>{coins.toLocaleString()}</span>
          <span style={{ fontSize: 10, color: "#92400e" }}>コイン</span>
        </div>
      </div>

      {/* ボディ */}
      <div className="page-body" style={{ flexDirection: "column", padding: 10, gap: 8, overflowY: "auto" }}>

        {/* カテゴリタブ */}
        <div style={{ display: "flex", gap: 5, flexShrink: 0, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "4px 12px", borderRadius: 99, border: "none", fontSize: 11, fontWeight: 700,
                cursor: "pointer",
                background: category === cat ? "#f59e0b" : "#f3f4f6",
                color:      category === cat ? "white"   : "#6b7280",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
          {filtered.map((item) => {
            const done       = exchanged.includes(item.id);
            const affordable = coins >= item.cost;
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: "12px 14px",
                  opacity: done ? 0.6 : 1,
                  border: done ? "1.5px solid #10b981" : "1.5px solid transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  {done && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 3,
                      fontSize: 10, fontWeight: 700, color: "#065f46",
                      background: "#dcfce7", padding: "2px 8px", borderRadius: 99,
                    }}>
                      <HiCheck style={{ width: 10, height: 10 }} />
                      交換済
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#1f2937", marginBottom: 4, lineHeight: 1.4 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 8 }}>
                  残り {item.stock} 個
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <HiStar style={{ width: 12, height: 12, color: "#f59e0b" }} />
                    <span style={{ fontWeight: 800, fontSize: 14, color: "#f59e0b" }}>{item.cost}</span>
                    <span style={{ fontSize: 9, color: "#9ca3af" }}>コイン</span>
                  </div>
                  <button
                    disabled={done || !affordable}
                    onClick={() => setConfirmId(item.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 8, border: "none",
                      fontSize: 11, fontWeight: 700, cursor: done || !affordable ? "not-allowed" : "pointer",
                      background: done ? "#e5e7eb" : affordable ? "#f59e0b" : "#f3f4f6",
                      color: done ? "#9ca3af" : affordable ? "white" : "#9ca3af",
                    }}
                  >
                    {done ? "交換済" : affordable ? "交換" : "不足"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* コイン取得方法の案内 */}
        <div className="card" style={{ padding: "12px 14px", flexShrink: 0, background: "#fffbeb", border: "1px solid #fde68a" }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: "#78350f", marginBottom: 6 }}>💡 コインの取得方法</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { action: "始業・終業報告の提出", coin: "+10" },
              { action: "RepoCaの完了",         coin: "+5"  },
              { action: "ミッション達成",        coin: "+報酬分" },
            ].map((r) => (
              <div key={r.action} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#92400e" }}>{r.action}</span>
                <span style={{ fontWeight: 700, color: "#f59e0b" }}>{r.coin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 交換確認モーダル */}
      {confirmId && (() => {
        const item = REWARD_ITEMS.find((r) => r.id === confirmId)!;
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setConfirmId(null)}
          >
            <div
              style={{ background: "white", borderRadius: 16, padding: "24px 24px 20px", width: 300, maxWidth: "90vw", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginBottom: 4 }}>{item.name}</div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                  <HiStar style={{ width: 14, height: 14, color: "#f59e0b" }} />
                  <span style={{ fontWeight: 800, fontSize: 16, color: "#f59e0b" }}>{item.cost}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>コイン消費</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginBottom: 16 }}>
                交換後の残高: <strong style={{ color: "#1a1a2e" }}>{(coins - item.cost).toLocaleString()}</strong> コイン
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmId(null)}>キャンセル</button>
                <button
                  className="btn"
                  style={{ flex: 2, background: "#f59e0b", color: "white", fontWeight: 700 }}
                  onClick={() => handleExchange(confirmId)}
                >
                  交換する
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
