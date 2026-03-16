"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type NewsCategory = "メンテナンス" | "新機能" | "キャンペーン" | "お知らせ";

export type NewsItem = {
  id: string;
  date: string;
  category: NewsCategory;
  title: string;
  body: string;
};

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "n1",
    date: "2026-01-10",
    category: "メンテナンス",
    title: "1月10日にメンテナンスを実施します",
    body: "2026年1月10日（土）23:00〜翌1:00の間、システムメンテナンスを実施します。この間はサービスをご利用いただけません。ご不便をおかけして申し訳ございません。",
  },
  {
    id: "n2",
    date: "2026-01-05",
    category: "新機能",
    title: "新機能追加！バッジシートが追加されました",
    body: "獲得したバッジを一覧で確認できる「バッジシート」機能が追加されました。マイページからご確認いただけます。",
  },
  {
    id: "n3",
    date: "2025-12-28",
    category: "キャンペーン",
    title: "今月のTOPユーザーに特別ボーナスをプレゼント",
    body: "今月最もRepoCaを完了したユーザーTOP3に、シーズンポイント500ptを贈呈します。ランキングはマイページからご確認ください。",
  },
];

interface NewsContextValue {
  newsList: NewsItem[];
  addNews: (item: Omit<NewsItem, "id">) => void;
  updateNews: (id: string, item: Omit<NewsItem, "id">) => void;
  deleteNews: (id: string) => void;
  reorderNews: (fromIndex: number, toIndex: number) => void;
}

const NewsContext = createContext<NewsContextValue>({
  newsList: [],
  addNews: () => {},
  updateNews: () => {},
  deleteNews: () => {},
  reorderNews: () => {},
});

export function NewsProvider({ children }: { children: ReactNode }) {
  const [newsList, setNewsList] = useState<NewsItem[]>([...DEFAULT_NEWS]);

  const addNews = (item: Omit<NewsItem, "id">) =>
    setNewsList((prev) => [{ ...item, id: `n_${Date.now()}` }, ...prev]);

  const updateNews = (id: string, item: Omit<NewsItem, "id">) =>
    setNewsList((prev) => prev.map((n) => (n.id === id ? { ...item, id } : n)));

  const deleteNews = (id: string) =>
    setNewsList((prev) => prev.filter((n) => n.id !== id));

  const reorderNews = (fromIndex: number, toIndex: number) =>
    setNewsList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

  return (
    <NewsContext.Provider value={{ newsList, addNews, updateNews, deleteNews, reorderNews }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  return useContext(NewsContext);
}
