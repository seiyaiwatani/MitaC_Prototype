# MitaC Prototype - プロジェクトガイド

## 概要

MitaC（ミタシー）は**ゲーミフィケーション型の工数管理アプリ**のプロトタイプ。
日々の作業報告・工数記録をゲーム要素（アバター、XP、バッジ、ミッション）で楽しくする仕組み。

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 16 + React 19 |
| 言語 | TypeScript 5 |
| スタイリング | Tailwind CSS v4 + PostCSS |
| アニメーション | GSAP 3 |
| アイコン | react-icons (hi, si) |
| 状態管理 | React Context API（4つのProvider） |
| データ | モックデータのみ（API/DB接続なし） |
| 配信 | GitHub Pages（静的エクスポート） |

## 重要な制約: 静的ビルド（GitHub Pages）

このプロジェクトは `next build` で静的HTML出力し、GitHub Pagesで配信する。
以下のルールを必ず守ること：

1. **`output: "export"`** - `next.config.ts` で静的エクスポートが有効。サーバーサイド機能（API Routes, Server Actions, SSR, middleware等）は使用不可
2. **`basePath: "/MitaC_Prototype"`** - 全てのパスはこのベースパス配下。アセットURLは `process.env.NEXT_PUBLIC_BASE_PATH` を付与する
3. **`trailingSlash: true`** - URLは末尾スラッシュ付き
4. **`images.unoptimized: true`** - Next.js Image Optimizationは無効（静的ホスティングのため）
5. **全ページが `"use client"` ディレクティブ** - クライアントサイドのみで動作
6. **動的ルーティング不可** - `[slug]` 等のダイナミックルートは `generateStaticParams` が必要

## ディレクトリ構成

```
src/
├── app/                        # ページ（App Router）
│   ├── layout.tsx              # ルートレイアウト（AppShell Provider）
│   ├── page.tsx                # ホーム（ゲームシーン、アバター表示）
│   ├── admin/page.tsx          # 管理画面（チーム報告一覧）
│   ├── mypage/
│   │   ├── page.tsx            # バッジ一覧
│   │   ├── missions/page.tsx   # ミッション一覧
│   │   └── rewards/page.tsx    # 報酬交換
│   ├── repoca/
│   │   ├── page.tsx            # RepoCa一覧（作業タスクカード）
│   │   └── new/page.tsx        # RepoCa新規作成
│   ├── report/
│   │   ├── page.tsx            # 報告ハブ
│   │   ├── start/page.tsx      # 始業報告
│   │   ├── end/page.tsx        # 終業報告
│   │   └── overtime/page.tsx   # 残業報告
│   └── settings/page.tsx       # 設定
├── components/                 # 共通コンポーネント
│   ├── AppShell.tsx            # 全Providerをラップ
│   ├── AppHeader.tsx           # 上部ヘッダー（ロゴ、ナビ、XPバー）
│   ├── BottomNav.tsx           # 下部ナビゲーション（6リンク）
│   ├── AvatarWithCostume.tsx   # アバター + コスチューム描画
│   ├── AvatarEditor.tsx        # アバター/コスチューム編集モーダル
│   └── BadgeDetailModal.tsx    # バッジ詳細モーダル
├── contexts/                   # React Context（状態管理）
│   ├── AvatarContext.tsx       # アバター選択、コスチューム装備
│   ├── ProjectContext.tsx      # プロジェクト一覧、追加
│   ├── RepoCaContext.tsx       # 今日のRepoCa、報告状態、お気に入り
│   └── MissionContext.tsx      # ミッション進捗
├── lib/                        # ユーティリティ・設定
│   ├── mock-data.ts            # 全モックデータ（ユーザー、PJ、RepoCa、バッジ等）
│   ├── badge-config.ts         # バッジアイコン・ティアスタイリング
│   └── utils.ts                # ユーティリティ関数（工数フォーマット等）
├── types/
│   └── index.ts                # 全TypeScript型定義
public/
├── avatars/                    # アバターSVG（fox, cat, doragon）
└── costumes/                   # コスチュームSVG（crown, medals, tie）
```

## 主要な型（`src/types/index.ts`）

- **Project** - プロジェクト（id, name, teamId, color, icon）
- **RepoCa** - 作業タスクカード（projectId, taskType, label, implScope, content, duration, xp）
- **User** - ユーザー（level, xp, currency, avatar）
- **Badge** - 技術バッジ（tier: bronze/silver/gold, tierHistory）
- **Mission** - ミッション（type: daily/monthly/unlimited, progress, goal）
- **DailyReport** - 日次報告（type: 始業/終業/残業, repoCas[]）

## Context Provider構成

```
ProjectProvider → AvatarProvider → RepoCaProvider → MissionProvider
```

Provider階層は `AppShell.tsx` で組み立て、`layout.tsx` で適用。

## 主な機能

| 機能 | 説明 |
|------|------|
| アバター | 3種類のキャラ + コスチューム装備（EXPボーナス付き） |
| RepoCa | 作業カード作成・分類（PJ、種別、ラベル、スコープ） |
| 日次報告 | 始業→残業→終業の3段階報告フロー |
| バッジ | 技術スキルバッジ（bronze/silver/goldティア進行） |
| ミッション | デイリー/マンスリー/無制限の目標と報酬 |
| レベリング | XPベースのレベルアップシステム |
| 管理画面 | チームメンバーの報告状況・工数分析 |

## スタイリング規約

- Tailwind CSS v4 ユーティリティクラスを基本使用
- グローバルスタイルは `src/app/globals.css` にカスタムクラス定義
- カラーテーマ: `--primary: #4f46e5`, `--success: #10b981`, `--danger: #ef4444`, `--accent: #f59e0b`
- レイアウト用クラス: `.page-root`, `.page-body`, `.split-layout`, `.report-layout`
- コンポーネント用クラス: `.repoca-card`, `.chip`, `.xp-bar`

## デプロイ

`.github/workflows/deploy.yml` により `main` ブランチへのpushで自動デプロイ：

1. Node.js 20 セットアップ
2. `npm ci` → `npm run build`（`/out` ディレクトリ生成）
3. GitHub Pages にデプロイ

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 静的ビルド（/out 生成）
npm run lint     # ESLint実行
```

## 開発時の注意点

- **新しいページを追加する場合**: `"use client"` ディレクティブを必ず付ける
- **画像・アセットのパス**: `${process.env.NEXT_PUBLIC_BASE_PATH}/avatars/xxx.svg` のようにベースパスを付与
- **リンク**: Next.js の `<Link>` コンポーネントを使えば basePath は自動付与される
- **データ追加**: `src/lib/mock-data.ts` にモックデータを追加。型は `src/types/index.ts` に定義
- **新しい状態が必要な場合**: `src/contexts/` にContextを追加し、`AppShell.tsx` のProvider階層に組み込む
- **UIはすべて日本語** - ラベル・テキストは日本語で統一
