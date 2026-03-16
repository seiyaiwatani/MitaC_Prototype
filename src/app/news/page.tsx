"use client";

import Link from "next/link";
import { useNews } from "@/contexts/NewsContext";
import type { NewsCategory } from "@/contexts/NewsContext";

const CATEGORY_STYLE: Record<NewsCategory, { bg: string; color: string }> = {
  メンテナンス: { bg: "#fef3c7", color: "#92400e" },
  新機能:       { bg: "#dbeafe", color: "#1e40af" },
  キャンペーン: { bg: "#fce7f3", color: "#9d174d" },
  お知らせ:     { bg: "#f3f4f6", color: "#374151" },
};

export default function NewsPage() {
  const { newsList } = useNews();

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* ヘッダー */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#374151",
            textDecoration: "none",
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          ‹
        </Link>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
          }}
        >
          お知らせ一覧
        </h1>
      </div>

      {/* ニュースリスト */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {newsList.length === 0 && (
          <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, paddingTop: 40 }}>
            お知らせはありません
          </div>
        )}
        {newsList.map((news) => {
          const catStyle = CATEGORY_STYLE[news.category] ?? { bg: "#f3f4f6", color: "#374151" };
          return (
            <div
              key={news.id}
              style={{
                background: "white",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: catStyle.bg,
                    color: catStyle.color,
                    borderRadius: 4,
                    padding: "2px 8px",
                    flexShrink: 0,
                  }}
                >
                  {news.category}
                </span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{news.date}</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0, lineHeight: 1.5 }}>
                {news.title}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
                {news.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
