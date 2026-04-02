"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import {
  HiFolder, HiChartBar, HiCalendar, HiPlus, HiCog, HiX, HiFlag, HiCheck,
  HiGlobeAlt, HiDeviceMobile, HiShoppingCart, HiDesktopComputer, HiBell, HiPencil, HiTrash, HiUserGroup,
} from "react-icons/hi";
import { useMission } from "@/contexts/MissionContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useNews } from "@/contexts/NewsContext";
import type { NewsCategory, NewsItem } from "@/contexts/NewsContext";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Mission } from "@/types";

/* ── 型定義 ── */
type DailyTask   = { name: string; min: number; fromStart?: boolean };
type DailySeg    = { projectId: string; min: number; tasks: DailyTask[] };
type TeamMember  = { id: string; name: string; reported: boolean; cohort: number };

/* ── モックデータ ── */
const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: "m1", name: "田中 太郎", reported: true,  cohort: 24 },
  { id: "m2", name: "鈴木 花子", reported: true,  cohort: 24 },
  { id: "m3", name: "佐藤 健",   reported: false, cohort: 24 },
  { id: "m4", name: "山田 優",   reported: true,  cohort: 24 },
  { id: "m5", name: "伊藤 舞",   reported: true,  cohort: 25 },
];

/** mock-data の proj.color に合わせたパステル背景色 */
const PROJ_COLOR: Record<string, string> = {
  p1: "#bbf7d0", p2: "#e9d5ff", p3: "#bfdbfe", p4: "#fde68a", p_other: "#f3f4f6",
};
/** mock-data の proj.textColor に合わせたテキスト色 */
const PROJ_TEXT_COLOR: Record<string, string> = {
  p1: "#065f46", p2: "#581c87", p3: "#1e3a8a", p4: "#78350f", p_other: "#6b7280",
};

const PROJ_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  p1: HiGlobeAlt,
  p2: HiDesktopComputer,
  p3: HiDeviceMobile,
  p4: HiShoppingCart,
};

type ProjectDetail = {
  description: string;
  members: { role: string; count: number }[];
  techStack: string;
  myRole: string;
  jobContent: string;
  assignDate: string;
};

const PROJ_DETAIL: Record<string, ProjectDetail> = {
  p1: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "ディレクター", count: 1 }, { role: "デザイナー", count: 1 }, { role: "エンジニア", count: 3 }],
    techStack: "Next.js, TypeScript など",
    myRole: "フロントエンドエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2026年2月9日〜",
  },
  p2: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "デザイナー", count: 2 }, { role: "エンジニア", count: 2 }],
    techStack: "WordPress, PHP など",
    myRole: "フロントエンドエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2025年11月1日〜",
  },
  p3: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "デザイナー", count: 1 }, { role: "エンジニア", count: 4 }],
    techStack: "React Native, TypeScript など",
    myRole: "モバイルエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2026年1月15日〜",
  },
  p4: {
    description: "ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。ここにプロジェクトの説明が入ります。",
    members: [{ role: "PM", count: 1 }, { role: "エンジニア", count: 3 }, { role: "デザイナー", count: 1 }],
    techStack: "Next.js, Go, PostgreSQL など",
    myRole: "フルスタックエンジニア",
    jobContent: "ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。ここに業務内容の説明が入ります。",
    assignDate: "2025年12月1日〜",
  },
};

/** date("2026-03-DD") → memberId → DailySeg[] */
const DAILY_WORK_BY_DATE: Record<string, Record<string, DailySeg[]>> = {
  "2026-03-02": {
    m1: [
      { projectId: "p1", min: 240, tasks: [{ name: "Contactページ作成", min: 150, fromStart: true }, { name: "デイリースクラム", min: 90 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "会社概要ページ修正", min: 90, fromStart: true }, { name: "定例MTG", min: 30 }] },
    ],
    m2: [
      { projectId: "p1", min: 180, tasks: [{ name: "stg環境インフラ構築", min: 120, fromStart: true }, { name: "レビュー対応", min: 60 }] },
    ],
    m3: [
      { projectId: "p2", min: 300, tasks: [{ name: "トップページデザイン実装", min: 180, fromStart: true }, { name: "画像最適化", min: 120 }] },
    ],
  },
  "2026-03-03": {
    m1: [
      { projectId: "p1", min: 300, tasks: [{ name: "ヘッダーコンポーネント修正", min: 180, fromStart: true }, { name: "コードレビュー", min: 120 }] },
    ],
    m2: [
      { projectId: "p3", min: 240, tasks: [{ name: "モバイルTOP画面作成", min: 180, fromStart: true }, { name: "リファインメント", min: 60 }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "ETLパイプライン設計", min: 150, fromStart: true }, { name: "チームMTG", min: 90 }] },
    ],
    m5: [
      { projectId: "p1", min: 120, tasks: [{ name: "APIエンドポイント実装", min: 90, fromStart: true }, { name: "コードレビュー", min: 30 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "ブログ一覧ページ作成", min: 120, fromStart: true }] },
    ],
  },
  "2026-03-04": {
    m1: [
      { projectId: "p1", min: 180, tasks: [{ name: "フォームバリデーション実装", min: 120, fromStart: true }, { name: "PR作成", min: 60 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "LP修正", min: 90, fromStart: true }, { name: "定例MTG", min: 30 }] },
    ],
    m3: [
      { projectId: "p2", min: 180, tasks: [{ name: "レスポンシブ対応", min: 120, fromStart: true }, { name: "クロスブラウザ確認", min: 60 }] },
      { projectId: "p4", min: 120, tasks: [{ name: "DB設計レビュー", min: 120, fromStart: true }] },
    ],
    m5: [
      { projectId: "p2", min: 240, tasks: [{ name: "カテゴリーページ作成", min: 150, fromStart: true }, { name: "SEO対応", min: 90 }] },
    ],
  },
  "2026-03-05": {
    m2: [
      { projectId: "p1", min: 240, tasks: [{ name: "CI/CDパイプライン構築", min: 150 }, { name: "テスト追加", min: 90 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "画面設計レビュー", min: 120 }] },
    ],
    m4: [
      { projectId: "p4", min: 300, tasks: [{ name: "データ検証スクリプト作成", min: 180 }, { name: "バグ修正", min: 120 }] },
    ],
    m5: [
      { projectId: "p1", min: 120, tasks: [{ name: "WebSocket実装", min: 90 }, { name: "デイリースクラム", min: 30 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "サブリーダー1on1", min: 60 }, { name: "進捗報告", min: 60 }] },
    ],
  },
  "2026-03-06": {
    m1: [
      { projectId: "p1", min: 360, tasks: [{ name: "認証機能実装", min: 240 }, { name: "コードレビュー", min: 120 }] },
    ],
    m2: [
      { projectId: "p1", min: 180, tasks: [{ name: "E2Eテスト作成", min: 120 }, { name: "レビュー対応", min: 60 }] },
    ],
    m3: [
      { projectId: "p2", min: 240, tasks: [{ name: "フッターデザイン実装", min: 150 }, { name: "アニメーション追加", min: 90 }] },
    ],
  },
  "2026-03-09": {
    m1: [
      { projectId: "p2", min: 180, tasks: [{ name: "採用ページ作成", min: 120 }, { name: "画像差し替え", min: 60 }] },
    ],
    m2: [
      { projectId: "p3", min: 300, tasks: [{ name: "プッシュ通知実装", min: 180 }, { name: "テスト", min: 120 }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "集計バッチ作成", min: 150 }, { name: "定例MTG", min: 90 }] },
    ],
    m5: [
      { projectId: "p1", min: 240, tasks: [{ name: "GraphQL API実装", min: 180 }, { name: "ドキュメント作成", min: 60 }] },
    ],
  },
  "2026-03-10": {
    m1: [
      { projectId: "p1", min: 240, tasks: [{ name: "ヘッダー作成", min: 105 }, { name: "リファインメント", min: 45 }, { name: "会社概要作成", min: 90 }] },
      { projectId: "p2", min: 60, tasks: [{ name: "サブリーダー1on1", min: 60 }] },
    ],
    m3: [
      { projectId: "p2", min: 240, tasks: [{ name: "検索機能実装", min: 150 }, { name: "スタイル調整", min: 90 }] },
    ],
    m5: [
      { projectId: "p2", min: 180, tasks: [{ name: "タグ機能実装", min: 120 }, { name: "テスト追加", min: 60 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "ログイン画面修正", min: 120 }] },
    ],
  },
  "2026-03-11": {
    m2: [
      { projectId: "p1", min: 180, tasks: [{ name: "Dockerファイル最適化", min: 120 }, { name: "レビュー対応", min: 60 }] },
      { projectId: "p3", min: 180, tasks: [{ name: "オフライン対応", min: 150 }, { name: "デイリースクラム", min: 30 }] },
    ],
    m4: [
      { projectId: "p4", min: 300, tasks: [{ name: "レポート機能実装", min: 180 }, { name: "DB最適化", min: 120 }] },
    ],
    m5: [
      { projectId: "p1", min: 240, tasks: [{ name: "管理画面API実装", min: 150 }, { name: "コードレビュー", min: 90 }] },
    ],
  },
  "2026-03-17": {
    m1: [
      { projectId: "p1", min: 240, tasks: [{ name: "マイページ実装", min: 150 }, { name: "レビュー対応", min: 90 }] },
    ],
    m2: [
      { projectId: "p3", min: 300, tasks: [{ name: "設定画面実装", min: 180 }, { name: "アニメーション追加", min: 120 }] },
    ],
    m3: [
      { projectId: "p2", min: 180, tasks: [{ name: "ブログ詳細ページ作成", min: 120 }, { name: "OGP対応", min: 60 }] },
      { projectId: "p4", min: 120, tasks: [{ name: "パフォーマンス調査", min: 120 }] },
    ],
    m5: [
      { projectId: "p2", min: 240, tasks: [{ name: "コメント機能実装", min: 150 }, { name: "バリデーション追加", min: 90 }] },
    ],
  },
  "2026-03-18": {
    m1: [
      { projectId: "p1", min: 240, tasks: [{ name: "Contactページ作成", min: 120 }, { name: "ヘッダーコンポーネント修正", min: 80 }, { name: "デイリースクラム", min: 40 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "会社概要ページ修正", min: 90 }, { name: "定例MTG", min: 30 }] },
    ],
    m2: [
      { projectId: "p1", min: 180, tasks: [{ name: "stg環境インフラ構築", min: 120 }, { name: "レビュー対応", min: 60 }] },
      { projectId: "p3", min: 180, tasks: [{ name: "モバイルTOP画面作成", min: 150 }, { name: "リファインメント", min: 30 }] },
    ],
    m3: [
      { projectId: "p2", min: 300, tasks: [{ name: "トップページデザイン実装", min: 180 }, { name: "画像最適化", min: 60 }, { name: "レスポンシブ対応", min: 60 }] },
      { projectId: "p4", min: 60, tasks: [{ name: "DB設計レビュー", min: 60 }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "ETLパイプライン設計", min: 120 }, { name: "データ検証スクリプト作成", min: 90 }, { name: "チームMTG", min: 30 }] },
    ],
    m5: [
      { projectId: "p1", min: 120, tasks: [{ name: "APIエンドポイント実装", min: 90 }, { name: "コードレビュー", min: 30 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "ブログ一覧ページ作成", min: 120 }] },
      { projectId: "p3", min: 60,  tasks: [{ name: "サブリーダー1on1", min: 60 }] },
    ],
  },
  "2026-03-23": {
    m1: [
      { projectId: "p1", min: 240, tasks: [{ name: "通知機能実装", min: 150, fromStart: true }, { name: "コードレビュー", min: 90 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "採用ページ修正", min: 90, fromStart: true }, { name: "定例MTG", min: 30 }] },
    ],
    m2: [
      { projectId: "p3", min: 300, tasks: [{ name: "カメラ機能実装", min: 180, fromStart: true }, { name: "テスト追加", min: 120 }] },
    ],
    m3: [
      { projectId: "p2", min: 240, tasks: [{ name: "イベントページ作成", min: 150, fromStart: true }, { name: "レスポンシブ対応", min: 90 }] },
    ],
    m4: [
      { projectId: "p4", min: 300, tasks: [{ name: "ダッシュボード設計", min: 180, fromStart: true }, { name: "データモデル定義", min: 120 }] },
    ],
    m5: [
      { projectId: "p1", min: 180, tasks: [{ name: "検索API実装", min: 120, fromStart: true }, { name: "デイリースクラム", min: 60 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "お問い合わせページ作成", min: 120, fromStart: true }] },
    ],
  },
  "2026-03-24": {
    m1: [
      { projectId: "p1", min: 360, tasks: [{ name: "ユーザー管理画面実装", min: 240, fromStart: true }, { name: "PR作成", min: 120 }] },
    ],
    m2: [
      { projectId: "p1", min: 180, tasks: [{ name: "Kubernetes設定", min: 120, fromStart: true }, { name: "レビュー対応", min: 60 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "位置情報機能実装", min: 120, fromStart: true }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "KPI集計クエリ作成", min: 150, fromStart: true }, { name: "チームMTG", min: 90 }] },
    ],
    m5: [
      { projectId: "p2", min: 180, tasks: [{ name: "プライバシーポリシーページ作成", min: 120, fromStart: true }, { name: "SEO対応", min: 60 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "通知画面UI実装", min: 120, fromStart: true }] },
    ],
  },
  "2026-03-25": {
    m1: [
      { projectId: "p2", min: 240, tasks: [{ name: "FAQ作成", min: 150, fromStart: true }, { name: "コンテンツ修正", min: 90 }] },
    ],
    m2: [
      { projectId: "p3", min: 300, tasks: [{ name: "決済機能実装", min: 180, fromStart: true }, { name: "セキュリティレビュー", min: 120 }] },
    ],
    m3: [
      { projectId: "p2", min: 180, tasks: [{ name: "サービス紹介ページ作成", min: 120, fromStart: true }, { name: "画像最適化", min: 60 }] },
      { projectId: "p4", min: 120, tasks: [{ name: "パフォーマンス計測", min: 120, fromStart: true }] },
    ],
    m4: [
      { projectId: "p4", min: 360, tasks: [{ name: "アラート機能実装", min: 210, fromStart: true }, { name: "バグ修正", min: 150 }] },
    ],
    m5: [
      { projectId: "p1", min: 240, tasks: [{ name: "ファイルアップロードAPI実装", min: 150, fromStart: true }, { name: "ドキュメント作成", min: 90 }] },
    ],
  },
  "2026-03-26": {
    m1: [
      { projectId: "p1", min: 180, tasks: [{ name: "権限管理実装", min: 120, fromStart: true }, { name: "コードレビュー", min: 60 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "採用ページ最終確認", min: 90, fromStart: true }, { name: "リファインメント", min: 30 }] },
    ],
    m2: [
      { projectId: "p1", min: 240, tasks: [{ name: "監視ツール導入", min: 150, fromStart: true }, { name: "アラート設定", min: 90 }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "月次レポート自動化", min: 150, fromStart: true }, { name: "定例MTG", min: 90 }] },
    ],
    m5: [
      { projectId: "p2", min: 300, tasks: [{ name: "ニュース一覧ページ実装", min: 180, fromStart: true }, { name: "ページネーション追加", min: 120 }] },
    ],
  },
  "2026-03-27": {
    m1: [
      { projectId: "p1", min: 300, tasks: [{ name: "セッション管理修正", min: 180, fromStart: true }, { name: "PR対応", min: 120 }] },
    ],
    m2: [
      { projectId: "p3", min: 240, tasks: [{ name: "アプリストア申請準備", min: 150, fromStart: true }, { name: "スクリーンショット作成", min: 90 }] },
    ],
    m3: [
      { projectId: "p2", min: 180, tasks: [{ name: "導入事例ページ作成", min: 120, fromStart: true }, { name: "クロスブラウザ確認", min: 60 }] },
    ],
    m4: [
      { projectId: "p4", min: 180, tasks: [{ name: "データパイプラインテスト", min: 120, fromStart: true }, { name: "チームMTG", min: 60 }] },
    ],
    m5: [
      { projectId: "p1", min: 120, tasks: [{ name: "WebhookAPI実装", min: 90, fromStart: true }, { name: "デイリースクラム", min: 30 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "マイページ画面実装", min: 120, fromStart: true }] },
    ],
  },
  "2026-03-30": {
    m1: [
      { projectId: "p2", min: 240, tasks: [{ name: "トップページリニューアル対応", min: 150, fromStart: true }, { name: "レビュー対応", min: 90 }] },
    ],
    m2: [
      { projectId: "p1", min: 180, tasks: [{ name: "CDN設定", min: 120, fromStart: true }, { name: "負荷テスト", min: 60 }] },
      { projectId: "p3", min: 120, tasks: [{ name: "アプリリリース対応", min: 120, fromStart: true }] },
    ],
    m3: [
      { projectId: "p2", min: 300, tasks: [{ name: "サービスページ修正", min: 180, fromStart: true }, { name: "アニメーション調整", min: 120 }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "Q1レポート作成", min: 150, fromStart: true }, { name: "定例MTG", min: 90 }] },
    ],
    m5: [
      { projectId: "p1", min: 240, tasks: [{ name: "バッチ処理API実装", min: 180, fromStart: true }, { name: "コードレビュー", min: 60 }] },
    ],
  },
  "2026-03-31": {
    m1: [
      { projectId: "p1", min: 180, tasks: [{ name: "月末リリース対応", min: 120, fromStart: true }, { name: "デプロイ確認", min: 60 }] },
      { projectId: "p2", min: 120, tasks: [{ name: "コンテンツ最終確認", min: 90, fromStart: true }, { name: "定例MTG", min: 30 }] },
    ],
    m2: [
      { projectId: "p3", min: 300, tasks: [{ name: "バグ修正対応", min: 180, fromStart: true }, { name: "ユーザーテスト", min: 120 }] },
    ],
    m3: [
      { projectId: "p2", min: 180, tasks: [{ name: "画像差し替え作業", min: 120, fromStart: true }, { name: "OGP確認", min: 60 }] },
    ],
    m4: [
      { projectId: "p4", min: 300, tasks: [{ name: "Q1データ集計", min: 180, fromStart: true }, { name: "チームMTG", min: 120 }] },
    ],
    m5: [
      { projectId: "p2", min: 180, tasks: [{ name: "ニュース詳細ページ実装", min: 120, fromStart: true }, { name: "SEO最終確認", min: 60 }] },
      { projectId: "p1", min: 120, tasks: [{ name: "月末リリースQA", min: 120, fromStart: true }] },
    ],
  },
  "2026-04-01": {
    m1: [
      { projectId: "p1", min: 240, tasks: [{ name: "4月スプリント計画", min: 90, fromStart: true }, { name: "新機能設計", min: 150 }] },
    ],
    m2: [
      { projectId: "p1", min: 120, tasks: [{ name: "インフラ棚卸し", min: 90, fromStart: true }, { name: "リファインメント", min: 30 }] },
      { projectId: "p3", min: 180, tasks: [{ name: "v2.0要件定義", min: 120, fromStart: true }, { name: "チームMTG", min: 60 }] },
    ],
    m4: [
      { projectId: "p4", min: 240, tasks: [{ name: "Q2データ基盤設計", min: 150, fromStart: true }, { name: "定例MTG", min: 90 }] },
    ],
    m5: [
      { projectId: "p2", min: 240, tasks: [{ name: "4月コンテンツ更新", min: 150, fromStart: true }, { name: "バナー差し替え", min: 90 }] },
    ],
  },
};

const AVAILABLE_MONTHS = Array.from(
  new Set(Object.keys(DAILY_WORK_BY_DATE).map((d) => d.slice(0, 7)))
).sort();


type View = "projects" | "daily" | "monthly" | "new-project" | "missions" | "news" | "members";

const NAV_ITEMS: { key: View; label: string; Icon: React.ComponentType<{ style?: React.CSSProperties }> }[] = [
  { key: "projects",    label: "プロジェクト一覧", Icon: HiFolder },
  { key: "daily",       label: "工数管理/日",      Icon: HiChartBar },
  { key: "monthly",     label: "工数管理/月",      Icon: HiCalendar },
  { key: "new-project", label: "プロジェクト作成", Icon: HiPlus },
  { key: "members",     label: "メンバー管理",     Icon: HiUserGroup },
  { key: "missions",    label: "ミッション管理",   Icon: HiFlag },
  { key: "news",        label: "ニュース管理",     Icon: HiBell },
];

type TooltipState = {
  title: string;
  titleColor: string;
  rows: { label: string; value: string }[];
  total: string;
  x: number;
  y: number;
} | null;

type ModalState = {
  member: TeamMember;
  mode: "daily" | "monthly";
} | null;

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  メンテナンス: { bg: "#fef3c7", color: "#92400e" },
  新機能:       { bg: "#dbeafe", color: "#1e40af" },
  キャンペーン: { bg: "#fce7f3", color: "#9d174d" },
  お知らせ:     { bg: "#f3f4f6", color: "#374151" },
};

function SortableNewsItem({
  item,
  isEditing,
  onEdit,
  onDelete,
}: {
  item: NewsItem;
  isEditing: boolean;
  onEdit: (item: NewsItem) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const cat = CAT_STYLE[item.category] ?? CAT_STYLE["お知らせ"];

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="card"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          borderLeft: isEditing ? "3px solid #007aff" : "3px solid transparent",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 4, padding: "1px 6px", background: cat.bg, color: cat.color }}>
              {item.category}
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{item.date}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>{item.title}</div>
          <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{item.body}</div>
        </div>

        <div style={{ display: "flex", gap: 4, flexShrink: 0 }} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }} title="編集">
            <HiPencil style={{ width: 15, height: 15 }} />
          </button>
          <button onClick={() => onDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#ef4444" }} title="削除">
            <HiTrash style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (role !== null && role !== "admin") router.replace("/");
  }, [role, router]);

  const [view, setView]         = useState<View>("projects");

  const [projName, setProjName]       = useState("");
  const [projMemo, setProjMemo]       = useState("");
  const [projMembers, setProjMembers] = useState<string[]>([]);
  const [projColor, setProjColor]     = useState("#bbf7d0");
  const [projTextColor, setProjTextColor] = useState("#065f46");

  const COLOR_PALETTE = [
    { color: "#bbf7d0", textColor: "#065f46", label: "グリーン" },
    { color: "#bfdbfe", textColor: "#1e3a8a", label: "ブルー" },
    { color: "#e9d5ff", textColor: "#581c87", label: "パープル" },
    { color: "#fde68a", textColor: "#78350f", label: "イエロー" },
    { color: "#fecaca", textColor: "#7f1d1d", label: "レッド" },
    { color: "#d1fae5", textColor: "#064e3b", label: "ミント" },
    { color: "#fed7aa", textColor: "#7c2d12", label: "オレンジ" },
    { color: "#e0f2fe", textColor: "#0c4a6e", label: "スカイ" },
  ];
  const { missions, toggleMission, addMission, deleteMission } = useMission();

  // チームメンバー管理
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [newMemberName, setNewMemberName]   = useState("");
  const [newMemberCohort, setNewMemberCohort] = useState(25);

  // ミッション作成フォーム
  const [mTitle, setMTitle]       = useState("");
  const [mDesc, setMDesc]         = useState("");
  const [mReward, setMReward]     = useState(30);
  const [mPassExp, setMPassExp]   = useState(20);
  const [mGoal, setMGoal]         = useState(1);
  const [mTargetIds, setMTargetIds] = useState<string[]>([]);

  const { projects, addProject } = useProjects();
  const { newsList, addNews, updateNews, deleteNews, reorderNews } = useNews();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleNewsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = newsList.findIndex((n) => n.id === active.id);
    const toIndex   = newsList.findIndex((n) => n.id === over.id);
    reorderNews(fromIndex, toIndex);
  };

  // ニュース管理フォーム
  const CATEGORIES: NewsCategory[] = ["お知らせ", "新機能", "メンテナンス", "キャンペーン"];
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [nTitle, setNTitle]   = useState("");
  const [nBody, setNBody]     = useState("");
  const [nDate, setNDate]     = useState(() => new Date().toISOString().slice(0, 10));
  const [nCategory, setNCategory] = useState<NewsCategory>("お知らせ");

  const resetNewsForm = () => {
    setEditingNews(null);
    setNTitle(""); setNBody("");
    setNDate(new Date().toISOString().slice(0, 10));
    setNCategory("お知らせ");
  };

  const startEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNTitle(item.title);
    setNBody(item.body);
    setNDate(item.date);
    setNCategory(item.category);
  };

  const submitNews = () => {
    const payload = { title: nTitle.trim(), body: nBody.trim(), date: nDate, category: nCategory };
    if (editingNews) {
      updateNews(editingNews.id, payload);
    } else {
      addNews(payload);
    }
    resetNewsForm();
  };

  const [selectedProjId, setSelectedProjId]           = useState<string>("p1");
  const [hoveredKey, setHoveredKey]                   = useState<string | null>(null);
  const [tooltip, setTooltip]                         = useState<TooltipState>(null);
  const [modal, setModal]                             = useState<ModalState>(null);
  const [deletingMissionId, setDeletingMissionId]     = useState<string | null>(null);
  const [selectedDailyMemberId, setSelectedDailyMemberId] = useState<string>("m1");
  const [expandedCohorts, setExpandedCohorts]         = useState<number[]>([24]);
  const [teamExpanded, setTeamExpanded]               = useState(true);
  const [selectedDate, setSelectedDate]               = useState<string>("2026-03-18");
  const [showCalendar, setShowCalendar]               = useState(false);
  const [commentInput, setCommentInput]               = useState("");
  const [selectedTaskDetail, setSelectedTaskDetail]   = useState<{ task: DailyTask; proj: ReturnType<typeof projects.find>; date: string } | null>(null);
  const [selectedMonthlyDetail, setSelectedMonthlyDetail] = useState<{ member: TeamMember; projectId: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(AVAILABLE_MONTHS[AVAILABLE_MONTHS.length - 2] ?? AVAILABLE_MONTHS[0]);

  const computedMonthlyWork = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    Object.entries(DAILY_WORK_BY_DATE)
      .filter(([date]) => date.startsWith(selectedMonth))
      .forEach(([, byMember]) => {
        Object.entries(byMember).forEach(([memberId, segs]) => {
          if (!result[memberId]) result[memberId] = {};
          segs.forEach((seg) => {
            result[memberId][seg.projectId] = (result[memberId][seg.projectId] ?? 0) + seg.min;
          });
        });
      });
    return result;
  }, [selectedMonth]);
  // key: "YYYY-MM-DD_memberId" → コメント一覧
  const [comments, setComments]                       = useState<Record<string, string[]>>({});

  const commentKey = `${selectedDate}_${selectedDailyMemberId}`;
  const submitComment = () => {
    const text = commentInput.trim();
    if (!text) return;
    setComments((prev) => ({ ...prev, [commentKey]: [...(prev[commentKey] ?? []), text] }));
    setCommentInput("");
  };

  const openModal = (member: TeamMember, mode: "daily" | "monthly") =>
    setModal({ member, mode });
  const closeModal = () => setModal(null);

  if (role !== "admin") return null;

  return (
    <div className="page-root">
      {/* サイドバー＋コンテンツ */}
      <div className="page-body admin-layout">

        {/* サイドバー */}
        <div className="admin-sidebar">
          {NAV_ITEMS.map((n) => (
            <button
              key={n.key}
              className={`admin-nav-item ${view === n.key ? "active" : ""}`}
              style={{ width: "100%", border: "none", textAlign: "left" }}
              onClick={() => setView(n.key)}
            >
              <n.Icon style={{ width: 15, height: 15, flexShrink: 0 }} />
              <span>{n.label}</span>
            </button>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className="admin-content">

          {/* ── プロジェクト一覧 ── */}
          {view === "projects" && (() => {
            const selProj   = projects.find((p) => p.id === selectedProjId) ?? projects[0];
            const selDetail = selProj ? (PROJ_DETAIL[selProj.id] ?? PROJ_DETAIL.p1) : null;
            return (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                {/* マスター・詳細 レイアウト */}
                <div style={{
                  display: "flex", flexDirection: "column", flex: 1, overflow: "hidden",
                  border: "1px solid #e5e7eb", borderRadius: 10,
                  background: "white",
                }}>
                {/* ページタイトル */}
                <div style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
                  アサインされているプロジェクト一覧
                </div>
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                  {/* 左: プロジェクトリスト */}
                  <div style={{
                    width: 230, flexShrink: 0,
                    borderRight: "1px solid #e5e7eb",
                    overflowY: "auto",
                  }}>
                    {projects.map((p) => {
                      const Icon     = PROJ_ICONS[p.id] ?? HiFolder;
                      const selected = selectedProjId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProjId(p.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: selected ? "14px 16px" : "12px 14px",
                            borderBottom: "1px solid #f3f4f6",
                            cursor: "pointer",
                            background: selected ? "#f3f4f6" : "white",
                            transition: "background 0.1s",
                          }}
                        >
                          <Icon style={{
                            width: 18, height: 18, flexShrink: 0,
                            color: selected ? (PROJ_TEXT_COLOR[p.id] ?? "#374151") : "#9ca3af",
                          }} />
                          <span style={{
                            flex: 1, fontSize: selected ? 14 : 13,
                            fontWeight: selected ? 700 : 500,
                            color: selected ? "#1a1a2e" : "#374151",
                            lineHeight: 1.3,
                          }}>
                            {p.name}
                          </span>
                          <span style={{ color: "#9ca3af", fontSize: 14, flexShrink: 0 }}>›</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* 右: プロジェクト詳細 */}
                  {selProj && selDetail && (
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                      {/* 概要 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>概要</div>
                        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                          {selDetail.description}
                        </p>
                      </div>

                      {/* メンバー */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>メンバー</div>
                          <span style={{ fontSize: 14, color: "#007aff", cursor: "pointer", fontWeight: 600 }}>
                            メンバーを見る &gt;
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {selDetail.members.map((m) => (
                            <div key={m.role} style={{ fontSize: 14, color: "#374151" }}>
                              {m.role}：{m.count}名
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 主な仕様技術 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>主な仕様技術</div>
                          <span style={{ fontSize: 14, color: "#007aff", cursor: "pointer", fontWeight: 600 }}>
                            すべて見る &gt;
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: "#374151" }}>{selDetail.techStack}</div>
                      </div>

                      {/* 役割 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>役割</div>
                        <div style={{ fontSize: 14, color: "#374151" }}>{selDetail.myRole}</div>
                      </div>

                      {/* 業務内容 */}
                      <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>業務内容</div>
                        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
                          {selDetail.jobContent}
                        </p>
                      </div>

                      {/* アサイン日 */}
                      <div>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>アサイン日</div>
                        <div style={{ fontSize: 14, color: "#374151" }}>{selDetail.assignDate}</div>
                      </div>
                    </div>
                  )}
                </div>{/* end inner row */}
                </div>{/* end white bg */}
              </div>
            );
          })()}

          {/* ── 工数管理/日 ── */}
          {view === "daily" && (() => {
            const selMember   = teamMembers.find((m) => m.id === selectedDailyMemberId) ?? teamMembers[0];
            const dayData     = DAILY_WORK_BY_DATE[selectedDate] ?? {};
            const segs        = dayData[selMember.id] ?? [];
            const tasks       = segs.flatMap((seg) => seg.tasks.map((t) => ({ ...t, projectId: seg.projectId })));
            const totalMin    = tasks.reduce((s, t) => s + t.min, 0);
            const maxMin      = 480;
            const projTotals  = segs.map((seg) => ({ projectId: seg.projectId, min: seg.min }));
            const cohorts     = Array.from(new Set(teamMembers.map((m) => m.cohort))).sort();
            const BAR_H       = 360;

            // カレンダー (2026年3月)
            const datesWithData = Object.keys(DAILY_WORK_BY_DATE);
            const [selYear, selMonth, selDay] = selectedDate.split("-").map(Number);
            const firstDow = new Date(2026, 2, 1).getDay(); // March 1 = Sunday = 0
            const daysInMonth = 31;
            const calCells: (number | null)[] = [
              ...Array(firstDow).fill(null),
              ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
            ];
            while (calCells.length % 7 !== 0) calCells.push(null);

            return (
              <div style={{ display: "flex", height: "100%", margin: 0, overflow: "hidden", borderRadius: 10, border: "1px solid #e5e7eb" }}>

                {/* 左: チームメンバーリスト */}
                <div style={{ width: 192, flexShrink: 0, borderRight: "1px solid #e5e7eb", overflowY: "auto", background: "white" }}>
                  {/* チーム名（折りたたみ） */}
                  <div
                    onClick={() => setTeamExpanded((v) => !v)}
                    style={{ padding: "10px 14px", fontSize: 14, fontWeight: 700, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
                  >
                    <span>〇〇チーム</span>
                    <span style={{ color: "#9ca3af", fontSize: 12 }}>{teamExpanded ? "∧" : "∨"}</span>
                  </div>

                  {/* コホート別 */}
                  {teamExpanded && cohorts.map((cohort) => {
                    const members    = teamMembers.filter((m) => m.cohort === cohort);
                    const isExpanded = expandedCohorts.includes(cohort);
                    return (
                      <div key={cohort}>
                        <div
                          onClick={() => setExpandedCohorts((prev) =>
                            prev.includes(cohort) ? prev.filter((c) => c !== cohort) : [...prev, cohort]
                          )}
                          style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600, background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                        >
                          <span>{cohort}卒 {members.length}名</span>
                          <span style={{ color: "#9ca3af", fontSize: 12 }}>{isExpanded ? "∧" : "∨"}</span>
                        </div>
                        {isExpanded && members.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => setSelectedDailyMemberId(m.id)}
                            style={{
                              padding: "8px 14px 8px 20px", fontSize: 13,
                              background: selectedDailyMemberId === m.id ? "#e8f2ff" : "white",
                              color: selectedDailyMemberId === m.id ? "#007aff" : "#374151",
                              fontWeight: selectedDailyMemberId === m.id ? 700 : 400,
                              cursor: "pointer",
                              borderLeft: selectedDailyMemberId === m.id ? "3px solid #007aff" : "3px solid transparent",
                              borderBottom: "1px solid #f9fafb",
                            }}
                          >
                            {m.name}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* 右: 選択メンバー詳細 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#f3f4f6" }}>

                  {/* ヘッダー行 */}
                  <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "8px 16px", display: "flex", alignItems: "center", gap: 28, flexShrink: 0, position: "relative" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{selMember.name}</span>

                    {/* 日付クリック → カレンダー */}
                    <button
                      onClick={() => setShowCalendar((v) => !v)}
                      style={{ fontSize: 14, fontWeight: 600, color: "#007aff", background: "none", border: "1.5px solid #b8c9e7", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}
                    >
                      {selYear}年{selMonth}月{selDay}日
                    </button>

                    {/* カレンダーポップオーバー */}
                    {showCalendar && (
                      <div
                        style={{ position: "absolute", top: "100%", left: 200, zIndex: 100, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 12, width: 240 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13, textAlign: "center", marginBottom: 8, color: "#1a1a2e" }}>2026年3月</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                          {["日","月","火","水","木","金","土"].map((d) => (
                            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9ca3af", padding: "2px 0" }}>{d}</div>
                          ))}
                          {calCells.map((day, i) => {
                            if (!day) return <div key={i} />;
                            const dateStr  = `2026-03-${String(day).padStart(2, "0")}`;
                            const hasData  = datesWithData.includes(dateStr);
                            const isSelected = dateStr === selectedDate;
                            const dow = (i % 7);
                            const isSun = dow === 0, isSat = dow === 6;
                            return (
                              <button
                                key={i}
                                onClick={() => { setSelectedDate(dateStr); setShowCalendar(false); }}
                                style={{
                                  textAlign: "center", fontSize: 12, padding: "4px 0",
                                  borderRadius: 6, border: "none", cursor: "pointer",
                                  background: isSelected ? "#007aff" : "transparent",
                                  color: isSelected ? "white" : isSun ? "#ef4444" : isSat ? "#3b82f6" : "#374151",
                                  fontWeight: isSelected ? 700 : hasData ? 600 : 400,
                                  opacity: hasData || isSelected ? 1 : 0.35,
                                  position: "relative",
                                }}
                              >
                                {day}
                                {hasData && !isSelected && (
                                  <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#007aff", display: "block" }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <span style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
                      勤務時間　：　{Math.floor(totalMin / 60)}時間
                    </span>
                  </div>

                  {/* コンテンツ */}
                  <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: 12, gap: 12 }}>

                    {/* 中央: PJグループ + バー（終業報告スタイル） */}
                    <div style={{ flex: 1, overflow: "hidden", display: "flex", gap: 8 }}>

                      {/* PJグループ列 */}
                      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                        {segs.length === 0 ? (
                          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                            この日のデータはありません
                          </div>
                        ) : segs.map((seg) => {
                          const proj = projects.find((p) => p.id === seg.projectId);
                          if (!proj) return null;
                          return (
                            <div key={seg.projectId} className="pj-group" style={{ background: proj.color ?? "#f3f4f6" }}>
                              <div className="pj-group-header" style={{ color: proj.textColor }}>
                                <span style={{ fontSize: 18 }}>{proj.icon}</span>
                                <span>{proj.name}</span>
                              </div>
                              {seg.tasks.map((task, i) => {
                                const isZero = task.min === 0;
                                return (
                                  <div key={i} className="card" onClick={() => setSelectedTaskDetail({ task, proj, date: selectedDate })} style={{
                                    padding: "8px 10px",
                                    height: 72,
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 4,
                                    flexShrink: 0,
                                    borderColor: isZero ? "#fca5a5" : undefined,
                                    cursor: "pointer",
                                  }}>
                                    <span style={{
                                      position: "absolute", top: 6, right: 8,
                                      fontSize: 11, fontWeight: 700, background: isZero ? "#fee2e2" : proj.color, color: isZero ? "#ef4444" : proj.textColor, borderRadius: 4, padding: "1px 6px",
                                    }}>
                                      {isZero ? "0分" : `${(task.min / 60).toFixed(2)}h`}
                                    </span>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: isZero ? "#ef4444" : "#1f2937", width: "100%", padding: "0 4px", display: "flex", alignItems: "center", gap: 4 }}>
                                      {task.fromStart && (
                                        <span title="始業報告で追加" style={{ fontSize: 10, color: "#60a5fa", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 3, padding: "1px 3px", lineHeight: 1.3, fontWeight: 700, flexShrink: 0 }}>
                                          始
                                        </span>
                                      )}
                                      {task.name}
                                    </div>
                                    <span style={{
                                      position: "absolute", bottom: 6, right: 8,
                                      fontSize: 10, color: "#9ca3af",
                                    }}>
                                      {selYear}/{selMonth}/{selDay}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {/* バー + 時間軸 */}
                      <div style={{ width: 60, flexShrink: 0, display: "flex", gap: 3 }}>
                        {/* 左: 時間ラベル列 */}
                        <div style={{ flex: 1, position: "relative" }}>
                          {/* セグメント境界ラベル */}
                          {(() => {
                            let cum = 0;
                            return segs.slice(0, -1).map((seg, i) => {
                              cum += seg.min;
                              const pct = (cum / maxMin) * 100;
                              if (pct > 95) return null;
                              return (
                                <span key={i} style={{
                                  position: "absolute", top: `${pct}%`, right: 0,
                                  transform: "translateY(-50%)",
                                  fontSize: 9, color: "#9ca3af", whiteSpace: "nowrap", lineHeight: 1,
                                  background: "white", padding: "0 1px",
                                }}>
                                  {(cum / 60).toFixed(1)}h
                                </span>
                              );
                            });
                          })()}
                          {/* 4h固定ライン */}
                          <span style={{
                            position: "absolute", top: "50%", right: 0,
                            transform: "translateY(-50%)",
                            fontSize: 9, color: "#9ca3af", whiteSpace: "nowrap", lineHeight: 1,
                          }}>4h</span>
                        </div>
                        {/* 右: バー本体 */}
                        <div style={{ width: 20, flexShrink: 0, display: "flex", flexDirection: "column", borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                          {segs.map((seg) => {
                            const proj = projects.find((p) => p.id === seg.projectId);
                            return (
                              <div key={seg.projectId} style={{
                                height: `${(seg.min / maxMin) * 100}%`,
                                background: proj?.color ?? "#e5e7eb",
                                minHeight: 2,
                              }} />
                            );
                          })}
                          <div style={{ flex: 1, background: "#f3f4f6" }} />
                        </div>
                      </div>

                    </div>

                    {/* 右パネル */}
                    <div style={{ width: 256, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", overflowX: "hidden" }}>

                      {/* プロジェクト工数サマリー */}
                      <div style={{ background: "white", borderRadius: 8, border: "1px solid #e5e7eb", padding: "10px 12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {projTotals.map((pt) => {
                            const proj  = projects.find((p) => p.id === pt.projectId);
                            const Icon  = PROJ_ICONS[pt.projectId];
                            const color = PROJ_TEXT_COLOR[pt.projectId] ?? "#6b7280";
                            return (
                              <div key={pt.projectId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                {Icon && <Icon style={{ width: 18, height: 18, color, flexShrink: 0 }} />}
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{proj?.name ?? "PJ名"}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{(pt.min / 60).toFixed(2)}時間</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* コメント */}
                      <div style={{ background: "white", borderRadius: 8, border: "1px solid #e5e7eb", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                        {/* 投稿済みコメント */}
                        {(comments[commentKey] ?? []).length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 2 }}>
                            {(comments[commentKey] ?? []).map((c, i) => (
                              <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#374151", lineHeight: 1.5, wordBreak: "break-all" }}>
                                {c}
                              </div>
                            ))}
                          </div>
                        )}
                        <textarea
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
                          placeholder="コメントを入力…"
                          rows={3}
                          style={{
                            width: "100%", resize: "none", border: "1px solid #d1d5db",
                            borderRadius: 6, padding: "6px 8px", fontSize: 12, color: "#374151",
                            outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                          }}
                        />
                        <button
                          onClick={submitComment}
                          style={{
                            width: "100%", padding: "8px 0",
                            background: commentInput.trim() ? "#007aff" : "white",
                            border: `1.5px solid ${commentInput.trim() ? "#007aff" : "#d1d5db"}`,
                            borderRadius: 8, fontSize: 13, fontWeight: 600,
                            cursor: "pointer",
                            color: commentInput.trim() ? "white" : "#374151",
                            transition: "background 0.15s, color 0.15s",
                          }}
                        >
                          コメントする
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── 工数管理/月 ── */}
          {view === "monthly" && (
            <div style={{ background: "white", borderRadius: 12, padding: 16, height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>工数管理 / 月</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ fontSize: 14, fontWeight: 600, border: "1.5px solid #b8c9e7", borderRadius: 6, padding: "2px 8px", color: "#007aff", background: "white", cursor: "pointer" }}
                >
                  {AVAILABLE_MONTHS.map((m) => {
                    const [y, mo] = m.split("-");
                    return <option key={m} value={m}>{y}年{Number(mo)}月</option>;
                  })}
                </select>
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                各メンバーの月合計工数をプロジェクト別に集計しています
              </div>

              {/* 凡例 */}
              <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                {projects.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: PROJ_COLOR[p.id] ?? "#6b7280", flexShrink: 0 }} />
                    <span style={{ color: "#374151" }}>{p.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {teamMembers.map((m) => {
                  const pjMap    = computedMonthlyWork[m.id] ?? {};
                  const segs     = Object.entries(pjMap).map(([pid, min]) => ({ projectId: pid, min }));
                  const totalMin = segs.reduce((s, x) => s + x.min, 0);
                  const totalH   = (totalMin / 60).toFixed(1);
                  const maxMin   = 9600;

                  return (
                    <div key={m.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5 }}>
                        {/* 名前クリック → モーダル */}
                        <span
                          onClick={() => openModal(m, "monthly")}
                          style={{
                            fontSize: 14, fontWeight: 700, color: "#007aff",
                            cursor: "pointer", userSelect: "none",
                            textDecoration: "underline", textDecorationStyle: "dotted",
                          }}
                        >
                          {m.name}
                        </span>
                        <span style={{ fontSize: 14, color: "#6b7280" }}>
                          合計 <strong style={{ color: "#1a1a2e" }}>{totalH}h</strong>
                        </span>
                      </div>

                      {/* スタックバー */}
                      <div style={{ height: 26, display: "flex", borderRadius: 6, overflow: "hidden", background: "#f3f4f6" }}>
                        {segs.map((seg, i) => {
                          const proj    = projects.find((p) => p.id === seg.projectId);
                          const key     = `monthly_${m.id}_${i}`;
                          const hovered = hoveredKey === key;
                          const pct     = Math.round((seg.min / totalMin) * 100);
                          return (
                            <div
                              key={i}
                              style={{
                                width: `${(seg.min / maxMin) * 100}%`,
                                background: PROJ_COLOR[seg.projectId] ?? "#9ca3af",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                borderRight: i < segs.length - 1 ? "1px solid rgba(255,255,255,0.5)" : "none",
                                overflow: "hidden", cursor: "pointer",
                                filter: hovered ? "brightness(1.25)" : "brightness(1)",
                                transition: "filter 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                setHoveredKey(key);
                                setTooltip({
                                  title: proj?.name ?? seg.projectId,
                                  titleColor: PROJ_TEXT_COLOR[seg.projectId],
                                  rows: [
                                    { label: "月間工数", value: `${(seg.min / 60).toFixed(1)}h` },
                                    { label: "全体比率", value: `${pct}%` },
                                  ],
                                  total: `${(seg.min / 60).toFixed(1)}h / ${totalH}h`,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              onMouseMove={(e) => setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)}
                              onMouseLeave={() => { setHoveredKey(null); setTooltip(null); }}
                              onClick={() => { setTooltip(null); setHoveredKey(null); setSelectedMonthlyDetail({ member: m, projectId: seg.projectId }); }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap", padding: "0 4px" }}>
                                {(seg.min / 60).toFixed(0)}h
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                        {segs.map((seg) => {
                          const proj = projects.find((p) => p.id === seg.projectId);
                          const pct  = Math.round((seg.min / totalMin) * 100);
                          return (
                            <span key={seg.projectId} style={{ fontSize: 14, color: "#6b7280", display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: PROJ_COLOR[seg.projectId], display: "inline-block" }} />
                              {proj?.name ?? seg.projectId}: {(seg.min / 60).toFixed(0)}h ({pct}%)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, borderTop: "1px solid #f3f4f6", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 14, color: "#9ca3af" }}>
                <span>0h</span><span>40h</span><span>80h</span><span>120h</span><span>160h</span>
              </div>
            </div>
          )}

          {/* ── ミッション管理 ── */}
          {view === "missions" && (
            <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

              {/* 左: ミッション一覧 */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>ミッション一覧</div>
                {(["daily", "monthly", "unlimited"] as Mission["type"][]).map((type) => {
                  const label = type === "daily" ? "日次" : type === "monthly" ? "月次" : "無期限";
                  const list  = missions.filter((m) => m.type === type);
                  return (
                    <div key={type} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>{label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {list.length === 0 ? (
                          <div style={{ fontSize: 14, color: "#9ca3af", padding: "6px 0" }}>なし</div>
                        ) : list.map((m) => (
                          <div
                            key={m.id}
                            className="card"
                            style={{ padding: "9px 12px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                            onClick={() => toggleMission(m.id)}
                          >
                            <div style={{
                              width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                              border: `2px solid ${m.completed ? "#10b981" : "#d1d5db"}`,
                              background: m.completed ? "#10b981" : "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "all 0.15s",
                            }}>
                              {m.completed && <HiCheck style={{ width: 11, height: 11, color: "white" }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: m.completed ? "#9ca3af" : "#1f2937", textDecoration: m.completed ? "line-through" : "none" }}>
                                {m.title}
                              </div>
                              <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 1 }}>{m.description}</div>
                              {m.type === "unlimited" && (
                                <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
                                  {(!m.targetIds || m.targetIds.length === 0) ? (
                                    <span style={{ fontSize: 11, background: "#f3f4f6", color: "#6b7280", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>全員対象</span>
                                  ) : m.targetIds.map((tid) => {
                                    const member = teamMembers.find((tm) => tm.id === tid);
                                    return member ? (
                                      <span key={tid} style={{ fontSize: 11, background: "#e8f2ff", color: "#007aff", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                                        {member.name}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end", flexShrink: 0 }}>
                              <span style={{ fontSize: 14, color: "#ea580c", fontWeight: 700 }}>+{m.reward} XP</span>
                              {m.passExpReward ? (
                                <span style={{ fontSize: 14, color: "#007aff", fontWeight: 700 }}>+{m.passExpReward} PXP</span>
                              ) : null}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingMissionId(m.id); }}
                              style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px 4px", flexShrink: 0, display: "flex", alignItems: "center" }}
                              title="削除"
                            >
                              <HiTrash style={{ width: 16, height: 16 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 右: ミッション作成フォーム */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>無期限ミッション追加</div>
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>タイトル</label>
                      <input value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="例: 始業報告を3日連続提出"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>説明</label>
                      <input value={mDesc} onChange={(e) => setMDesc(e.target.value)} placeholder="ミッションの詳細説明"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "#007aff", display: "block", marginBottom: 3 }}>XP</label>
                        <input type="number" min={0} value={mReward} onChange={(e) => setMReward(Number(e.target.value))}
                          style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 14, fontWeight: 600, color: "#007aff", display: "block", marginBottom: 3 }}>PXP</label>
                        <input type="number" min={0} value={mPassExp} onChange={(e) => setMPassExp(Number(e.target.value))}
                          style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5 }}>
                        対象者
                        <span style={{ fontSize: 12, fontWeight: 400, color: "#9ca3af", marginLeft: 6 }}>（未選択で全員対象）</span>
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {teamMembers.map((m) => {
                          const checked = mTargetIds.includes(m.id);
                          return (
                            <label key={m.id} style={{
                              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                              padding: "5px 8px", borderRadius: 6,
                              background: checked ? "#e8f2ff" : "#f9fafb",
                              border: `1px solid ${checked ? "#007aff" : "#e5e7eb"}`,
                              transition: "background 0.1s",
                            }}>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => setMTargetIds((prev) =>
                                  checked ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                                )}
                                style={{ width: 14, height: 14, accentColor: "#007aff", cursor: "pointer" }}
                              />
                              <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? "#007aff" : "#374151" }}>
                                {m.name}
                              </span>
                              <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>{m.cohort}卒</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: 12, fontSize: 14 }}
                    disabled={!mTitle.trim()}
                    onClick={() => {
                      addMission({ type: "unlimited", title: mTitle.trim(), description: mDesc.trim(), reward: mReward, passExpReward: mPassExp, goal: mGoal, progress: 0, completed: false, targetIds: mTargetIds.length > 0 ? mTargetIds : undefined });
                      setMTitle(""); setMDesc(""); setMReward(30); setMPassExp(20); setMGoal(1); setMTargetIds([]);
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── ニュース管理 ── */}
          {view === "news" && (
            <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

              {/* 左: ニュース一覧 */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                  ニュース一覧
                </div>
                {newsList.length === 0 && (
                  <div style={{ fontSize: 14, color: "#9ca3af", padding: "6px 0" }}>登録されたニュースはありません</div>
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNewsDragEnd}>
                  <SortableContext items={newsList.map((n) => n.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {newsList.map((item) => (
                        <SortableNewsItem
                          key={item.id}
                          item={item}
                          isEditing={editingNews?.id === item.id}
                          onEdit={startEditNews}
                          onDelete={(id) => { deleteNews(id); if (editingNews?.id === id) resetNewsForm(); }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* 右: 追加・編集フォーム */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                  {editingNews ? "ニュース編集" : "ニュース追加"}
                </div>
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>カテゴリ</label>
                      <select value={nCategory} onChange={(e) => setNCategory(e.target.value as NewsCategory)}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 6px", fontSize: 14 }}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>日付</label>
                      <input type="date" value={nDate} onChange={(e) => setNDate(e.target.value)}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>タイトル</label>
                      <input value={nTitle} onChange={(e) => setNTitle(e.target.value)} placeholder="例: メンテナンスのお知らせ"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>本文</label>
                      <textarea value={nBody} onChange={(e) => setNBody(e.target.value)} placeholder="お知らせの内容" rows={4}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14, resize: "vertical" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {editingNews && (
                      <button className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }} onClick={resetNewsForm}>
                        キャンセル
                      </button>
                    )}
                    <button
                      className="btn btn-primary"
                      style={{ flex: 2, fontSize: 14 }}
                      disabled={!nTitle.trim()}
                      onClick={submitNews}
                    >
                      {editingNews ? "更新" : "追加"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── メンバー管理 ── */}
          {view === "members" && (
            <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", padding: 16, height: "100%", overflowY: "auto", boxSizing: "border-box" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

              {/* 左: メンバー一覧 */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>チームメンバー一覧</div>
                {(() => {
                  const cohorts = Array.from(new Set(teamMembers.map((m) => m.cohort))).sort();
                  return cohorts.map((cohort) => (
                    <div key={cohort} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>{cohort}卒</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {teamMembers.filter((m) => m.cohort === cohort).map((m) => (
                          <div key={m.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                              background: "#e8f2ff", display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 14, fontWeight: 700, color: "#007aff",
                            }}>
                              {m.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{m.name}</div>
                              <div style={{ fontSize: 12, color: "#9ca3af" }}>{m.cohort}卒</div>
                            </div>
                            <div style={{
                              fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                              background: m.reported ? "#dcfce7" : "#fee2e2",
                              color: m.reported ? "#166534" : "#991b1b",
                            }}>
                              {m.reported ? "報告済み" : "未報告"}
                            </div>
                            <button
                              onClick={() => setTeamMembers((prev) => prev.filter((x) => x.id !== m.id))}
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#ef4444" }}
                              title="削除"
                            >
                              <HiTrash style={{ width: 15, height: 15 }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* 右: メンバー追加フォーム */}
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>メンバー追加</div>
                <div className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>氏名</label>
                      <input
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="例: 山田 太郎"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 3 }}>卒業年度</label>
                      <input
                        type="number"
                        min={20}
                        max={30}
                        value={newMemberCohort}
                        onChange={(e) => setNewMemberCohort(Number(e.target.value))}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 14 }}
                      />
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: 12, fontSize: 14 }}
                    disabled={!newMemberName.trim()}
                    onClick={() => {
                      const id = `m${Date.now()}`;
                      setTeamMembers((prev) => [...prev, { id, name: newMemberName.trim(), reported: false, cohort: newMemberCohort }]);
                      setNewMemberName("");
                    }}
                  >
                    追加
                  </button>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── プロジェクト作成 ── */}
          {view === "new-project" && (
            <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e7eb", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* タイトル */}
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
                プロジェクト作成
              </div>
              {/* 2カラム */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 0, flex: 1, overflow: "hidden" }}>

                {/* 左: フォーム */}
                <div style={{ padding: 20, overflowY: "auto", borderRight: "1px solid #e5e7eb" }}>
                  {/* プロジェクト名 */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>プロジェクト名</label>
                    <input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="例: 社内基盤システム刷新"
                      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: 14, boxSizing: "border-box" }} />
                  </div>

                  {/* メモ */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>メモ</label>
                    <textarea value={projMemo} onChange={(e) => setProjMemo(e.target.value)} placeholder="プロジェクトの概要・備考" rows={4}
                      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 10px", fontSize: 14, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
                  </div>

                  {/* 識別カラー */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 8 }}>識別カラー</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {COLOR_PALETTE.map((p) => {
                        const selected = projColor === p.color;
                        return (
                          <button
                            key={p.color}
                            title={p.label}
                            onClick={() => { setProjColor(p.color); setProjTextColor(p.textColor); }}
                            style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: p.color,
                              border: selected ? `3px solid ${p.textColor}` : "2px solid transparent",
                              cursor: "pointer",
                              boxShadow: selected ? `0 0 0 1px ${p.textColor}44` : "none",
                              outline: "none", position: "relative",
                            }}
                          >
                            {selected && <span style={{ color: p.textColor, fontSize: 16, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: projColor, color: projTextColor, borderRadius: 6, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
                      <span>📁</span>
                      <span>{projName.trim() || "プロジェクト名"}</span>
                    </div>
                  </div>
                </div>

                {/* 右: メンバー配属 + ボタン */}
                <div style={{ display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#6b7280", marginBottom: 10 }}>メンバー配属</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    {teamMembers.map((m) => {
                      const checked = projMembers.includes(m.id);
                      return (
                        <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: checked ? projColor : "#f9fafb", border: `1px solid ${checked ? projTextColor + "44" : "#e5e7eb"}`, transition: "background 0.1s" }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setProjMembers((prev) => checked ? prev.filter((id) => id !== m.id) : [...prev, m.id])}
                            style={{ width: 15, height: 15, accentColor: projTextColor, cursor: "pointer" }}
                          />
                          <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? projTextColor : "#374151" }}>{m.name}</span>
                          <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>{m.cohort}卒</span>
                        </label>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 20, flexShrink: 0 }}>
                    <button className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }}
                      onClick={() => { setView("projects"); setProjName(""); setProjMemo(""); setProjMembers([]); setProjColor("#bbf7d0"); setProjTextColor("#065f46"); }}>
                      キャンセル
                    </button>
                    <button className="btn btn-primary" style={{ flex: 2, fontSize: 14 }} disabled={!projName.trim()}
                      onClick={() => { addProject(projName.trim(), projColor, projTextColor); setProjName(""); setProjMemo(""); setProjMembers([]); setProjColor("#bbf7d0"); setProjTextColor("#065f46"); setView("projects"); }}>
                      登録
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ホバーツールチップ */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x + 14, top: tooltip.y - 10,
          background: "white", border: "1px solid #e5e7eb", borderRadius: 8,
          padding: "10px 14px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          zIndex: 9999, fontSize: 14, minWidth: 180, pointerEvents: "none",
        }}>
          <div style={{ fontWeight: 700, color: tooltip.titleColor, marginBottom: 6, fontSize: 14, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: tooltip.titleColor, display: "inline-block" }} />
            {tooltip.title}
          </div>
          {tooltip.rows.map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", gap: 16, padding: "2px 0",
              borderBottom: i < tooltip.rows.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <span style={{ color: "#374151" }}>{r.label}</span>
              <span style={{ color: "#9ca3af", whiteSpace: "nowrap" }}>{r.value}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 5, paddingTop: 4, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, color: "#374151" }}>合計</span>
            <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{tooltip.total}</span>
          </div>
        </div>
      )}

      {/* ミッション削除確認モーダル */}
      {deletingMissionId && (() => {
        const target = missions.find((m) => m.id === deletingMissionId);
        return (
          <div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10001,
            }}
            onClick={() => setDeletingMissionId(null)}
          >
            <div
              style={{
                background: "white", borderRadius: 12, padding: 24, width: 320,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <HiTrash style={{ width: 20, height: 20, color: "#ef4444", flexShrink: 0 }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>ミッションを削除</div>
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 20, lineHeight: 1.6 }}>
                「<span style={{ fontWeight: 700, color: "#1f2937" }}>{target?.title}</span>」を本当に削除してもよろしいですか？この操作は元に戻せません。
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setDeletingMissionId(null)}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid #e5e7eb",
                    background: "white", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer",
                  }}
                >キャンセル</button>
                <button
                  onClick={() => { deleteMission(deletingMissionId); setDeletingMissionId(null); }}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                    background: "#ef4444", fontSize: 14, fontWeight: 600, color: "white", cursor: "pointer",
                  }}
                >削除する</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* モーダル */}
      {modal && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white", borderRadius: 14,
              padding: "24px 28px", width: 560, maxWidth: "90vw",
              maxHeight: "80vh", overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>{modal.member.name}</div>
                <div style={{ fontSize: 14, color: "#6b7280", marginTop: 3 }}>
                  {modal.mode === "daily" ? "2026/02/24 の工数詳細" : "2026年2月 の月次工数"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, padding: "3px 12px", borderRadius: 99,
                  background: modal.member.reported ? "#dcfce7" : "#fee2e2",
                  color:      modal.member.reported ? "#166534"  : "#991b1b",
                }}>
                  {modal.member.reported ? "報告済" : "未報告"}
                </span>
                <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                  <HiX style={{ width: 20, height: 20 }} />
                </button>
              </div>
            </div>

            {/* ── 日別モーダル本体 ── */}
            {modal.mode === "daily" && (() => {
              const segs  = (DAILY_WORK_BY_DATE[selectedDate] ?? {})[modal.member.id] ?? [];
              const total = segs.reduce((s: number, x: DailySeg) => s + x.min, 0);
              return (
                <>
                  {/* 合計バー */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280", marginBottom: 5 }}>
                      <span>本日合計</span>
                      <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{(total / 60).toFixed(1)}h / 8.0h</span>
                    </div>
                    <div style={{ height: 10, background: "#f3f4f6", borderRadius: 5, display: "flex", overflow: "hidden" }}>
                      {segs.map((seg: DailySeg, i: number) => (
                        <div key={i} style={{
                          width: `${(seg.min / 480) * 100}%`,
                          background: PROJ_COLOR[seg.projectId],
                          borderRight: i < segs.length - 1 ? "1px solid white" : "none",
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* プロジェクト別タスク */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {segs.map((seg: DailySeg) => {
                      const proj = projects.find((p) => p.id === seg.projectId);
                      return (
                        <div key={seg.projectId} style={{ border: "1px solid #f3f4f6", borderRadius: 8, overflow: "hidden" }}>
                          {/* PJ見出し */}
                          <div style={{
                            padding: "8px 14px",
                            background: PROJ_COLOR[seg.projectId] ?? "#f3f4f6",
                            borderBottom: "1px solid #f3f4f6",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: PROJ_TEXT_COLOR[seg.projectId] }} />
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{proj?.name}</span>
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: PROJ_TEXT_COLOR[seg.projectId] }}>
                              {(seg.min / 60).toFixed(1)}h
                            </span>
                          </div>
                          {/* タスク一覧 */}
                          {seg.tasks.map((t: DailyTask, i: number) => (
                            <div key={i} style={{
                              display: "flex", justifyContent: "space-between",
                              padding: "7px 14px",
                              borderBottom: i < seg.tasks.length - 1 ? "1px solid #f9fafb" : "none",
                              background: "white",
                            }}>
                              <span style={{ fontSize: 14, color: "#374151" }}>{t.name}</span>
                              <span style={{ fontSize: 14, color: "#9ca3af", whiteSpace: "nowrap" }}>{t.min}分</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* ── 月別モーダル本体 ── */}
            {modal.mode === "monthly" && (() => {
              const pjMap    = computedMonthlyWork[modal.member.id] ?? {};
              const segs     = Object.entries(pjMap).map(([pid, min]) => ({ projectId: pid, min }));
              const totalMin = segs.reduce((s, x) => s + x.min, 0);
              const maxMin   = 9600;

              return (
                <>
                  {/* 合計サマリー */}
                  <div style={{
                    background: "#f9fafb", borderRadius: 8, padding: "12px 16px",
                    marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 2 }}>月間合計工数</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e" }}>
                        {(totalMin / 60).toFixed(1)}<span style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginLeft: 2 }}>h</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 2 }}>稼働率</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#007aff" }}>
                        {Math.round((totalMin / maxMin) * 100)}<span style={{ fontSize: 14, color: "#6b7280" }}>%</span>
                      </div>
                    </div>
                  </div>

                  {/* プロジェクト別グラフ */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {segs.map((seg) => {
                      const proj = projects.find((p) => p.id === seg.projectId);
                      const pct  = Math.round((seg.min / totalMin) * 100);
                      return (
                        <div key={seg.projectId}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 10, height: 10, borderRadius: 2, background: PROJ_COLOR[seg.projectId] }} />
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{proj?.name}</span>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <span style={{ fontSize: 14, color: "#6b7280" }}>{pct}%</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: PROJ_TEXT_COLOR[seg.projectId] }}>
                                {(seg.min / 60).toFixed(1)}h
                              </span>
                            </div>
                          </div>
                          {/* バー */}
                          <div style={{ height: 12, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                            <div style={{
                              width: `${pct}%`, height: "100%",
                              background: PROJ_COLOR[seg.projectId],
                              borderRadius: 6, transition: "width 0.3s ease",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* 月別PJ詳細モーダル（日ごとの積み上げ） */}
      {selectedMonthlyDetail && (() => {
        const { member, projectId } = selectedMonthlyDetail;
        const proj = projects.find((p) => p.id === projectId);

        // DAILY_WORK_BY_DATE から該当メンバー×PJの日別データを集計
        const dailyRows = Object.entries(DAILY_WORK_BY_DATE)
          .filter(([, byMember]) => byMember[member.id])
          .map(([date, byMember]) => {
            const segs = byMember[member.id] ?? [];
            const seg  = segs.find((s) => s.projectId === projectId);
            if (!seg) return null;
            return { date, min: seg.min, tasks: seg.tasks };
          })
          .filter((r): r is { date: string; min: number; tasks: DailyTask[] } => r !== null)
          .sort((a, b) => a.date.localeCompare(b.date));

        const totalMin = dailyRows.reduce((s, r) => s + r.min, 0);
        const maxMin   = Math.max(...dailyRows.map((r) => r.min), 1);

        const fmtMin = (m: number) => m < 60 ? `${m}分` : `${Math.floor(m / 60)}時間${m % 60 > 0 ? `${m % 60}分` : ""}`;
        const fmtDate = (d: string) => { const [, mo, dy] = d.split("-"); return `${Number(mo)}/${Number(dy)}`; };

        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setSelectedMonthlyDetail(null)}
          >
            <div
              style={{ background: "white", borderRadius: 16, width: 440, maxWidth: "94vw", maxHeight: "80vh", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden", display: "flex", flexDirection: "column" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div style={{ background: proj?.color ?? "#f3f4f6", padding: "14px 18px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {proj && <span style={{ fontSize: 20 }}>{proj.icon}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: proj?.textColor ?? "#6b7280", opacity: 0.8 }}>{member.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: proj?.textColor ?? "#1f2937" }}>{proj?.name ?? projectId}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: proj?.textColor ?? "#6b7280", opacity: 0.8 }}>月間合計</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: proj?.textColor ?? "#1f2937" }}>{fmtMin(totalMin)}</div>
                </div>
                <button onClick={() => setSelectedMonthlyDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.4)", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0, marginLeft: 4 }}>×</button>
              </div>

              {/* 日別リスト */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 18px" }}>
                {dailyRows.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 14, padding: 24 }}>データなし</div>
                ) : dailyRows.map((row) => {
                  const barPct = (row.min / maxMin) * 100;
                  return (
                    <div key={row.date} style={{ marginBottom: 14 }}>
                      {/* 日付 + 工数 */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{fmtDate(row.date)}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>{fmtMin(row.min)}</span>
                      </div>
                      {/* バー */}
                      <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden", marginBottom: 5 }}>
                        <div style={{ width: `${barPct}%`, height: "100%", background: PROJ_COLOR[projectId] ?? "#9ca3af", borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                      {/* タスクリスト */}
                      {row.tasks.map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", fontSize: 13, color: "#6b7280" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#d1d5db", flexShrink: 0 }} />
                          {t.fromStart && (
                            <span style={{ fontSize: 9, color: "#60a5fa", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 3, padding: "0px 3px", fontWeight: 700, flexShrink: 0 }}>始</span>
                          )}
                          <span style={{ flex: 1 }}>{t.name}</span>
                          <span style={{ fontWeight: 600, color: "#374151", flexShrink: 0 }}>{fmtMin(t.min)}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* タスク詳細モーダル */}
      {selectedTaskDetail && (() => {
        const { task, proj, date } = selectedTaskDetail;
        const [y, m, d] = date.split("-").map(Number);
        return (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setSelectedTaskDetail(null)}
          >
            <div
              style={{ background: "white", borderRadius: 16, width: 320, maxWidth: "92vw", boxShadow: "0 12px 40px rgba(0,0,0,0.22)", overflow: "hidden" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div style={{ background: proj?.color ?? "#f3f4f6", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    {proj && <span style={{ fontSize: 18 }}>{proj.icon}</span>}
                    <span style={{ fontSize: 14, fontWeight: 700, color: proj?.textColor ?? "#374151" }}>{proj?.name ?? "その他"}</span>
                    {task.fromStart && (
                      <span style={{ fontSize: 10, color: "#60a5fa", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 3, padding: "1px 3px", lineHeight: 1.3, fontWeight: 700 }}>始</span>
                    )}
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: proj?.textColor ?? "#1f2937", margin: 0, lineHeight: 1.4 }}>{task.name}</p>
                </div>
                <button onClick={() => setSelectedTaskDetail(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(0,0,0,0.4)", fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
              </div>
              {/* 詳細行 */}
              <div style={{ padding: "14px 20px 18px" }}>
                {[
                  { label: "日付",   value: `${y}年${m}月${d}日` },
                  { label: "工数",   value: task.min === 0 ? "0分" : task.min < 60 ? `${task.min}分` : `${Math.floor(task.min / 60)}時間${task.min % 60 > 0 ? `${task.min % 60}分` : ""}` },
                  { label: "種別",   value: task.fromStart ? "始業報告で追加" : "終業報告で追加" },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14 }}>
                    <span style={{ color: "#6b7280", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ color: "#1f2937", fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
