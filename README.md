# MitaC_Prototype

## 2026/03/10 修正履歴

### 1. 報告関連の修正 — kikuchi-hibiki（15:28）

**コミット:** `9a37e34`

**修正内容:**

- **ホームページ（`src/app/page.tsx`）**
  - 3カラムグリッドレイアウトの調整（バッジの高さをアバターに合わせる、ミッションセクションの配置変更）
  - 本日のタスク表示をRepoCaContextの`todayRepoCas`から取得するように変更
  - 始業報告前はタスクを表示しない仕様に対応
  - タスクの完了トグル機能をContextベースに変更
  - グリッドとメニューバー間の余白調整（下部padding: 20px）
- **始業報告（`src/app/report/start/page.tsx`）**
  - 初期選択IDをハードコードから空配列に変更
  - RepoCa編集モーダルの追加
  - お気に入り機能のContextベース化
- **終業報告（`src/app/report/end/page.tsx`）**
  - `bulkUpdateCompleted`による完了状態の一括同期処理を追加
  - 終業報告完了時にRepoCa一覧の完了状態を反映
- **残業報告（`src/app/report/overtime/page.tsx`）**
  - 報告日付の管理機能追加
- **報告一覧（`src/app/report/page.tsx`）**
  - ローカルstateを廃止し、Context経由でtodayRepoCasを使用
- **RepoCaContext（`src/contexts/RepoCaContext.tsx`）**
  - `toggleTodayRepoCa`: todayRepoCasとallRepoCasの両方を更新する同期処理
  - `bulkUpdateCompleted`: 終業報告時の一括完了状態更新
  - `setTodayFromIds`: 始業報告で選択されたIDからtodayRepoCasをセット
  - `resetDailyReports`: 日次リセット機能
  - localStorage永続化対応
- **RepoCa新規作成（`src/app/repoca/new/page.tsx`）** — 軽微な修正
- **RepoCa一覧（`src/app/repoca/page.tsx`）** — 軽微な修正

---

### 2. 修正 — SeiyaIwatani（16:38）

**コミット:** `74231de`

**修正内容:**

- **ホームページ（`src/app/page.tsx`）** — レイアウト改善
- **プロジェクト一覧（`src/app/projects/page.tsx`）** — 新規作成
- **RepoCa一覧（`src/app/repoca/page.tsx`）** — 大幅リファクタリング
- **設定ページ（`src/app/settings/page.tsx`）** — 修正
- **AppHeader（`src/components/AppHeader.tsx`）** — 修正
- **AvatarEditor（`src/components/AvatarEditor.tsx`）** — 機能改善
- **AvatarWithCostume（`src/components/AvatarWithCostume.tsx`）** — 修正
- **BottomNav（`src/components/BottomNav.tsx`）** — 修正
- **AvatarContext（`src/contexts/AvatarContext.tsx`）** — 修正

---

### 3. RepoCa修正 — SeiyaIwatani（17:06）

**コミット:** `db5247d`

**修正内容:**

- **管理画面（`src/app/admin/page.tsx`）** — 機能拡張
- **ホームページ（`src/app/page.tsx`）** — 追加修正
- **RepoCa一覧（`src/app/repoca/page.tsx`）** — リファクタリング
- **AppHeader（`src/components/AppHeader.tsx`）** — 簡素化

---

### 4. repocaの修正 — kikuchi-hibiki（18:56）

**コミット:** `3450779`

**修正内容:**

- **ホームページ（`src/app/page.tsx`）**
  - ミッションのチェックボックス削除（自動検知による完了のみに変更）
  - ミッションのクリックトグル操作を削除
- **ミッション一覧（`src/app/mypage/missions/page.tsx`）**
  - ミッションカードのクリックトグル削除
  - `toggleMission`の未使用import削除
- **マイページ（`src/app/mypage/page.tsx`）** — 修正
- **始業報告（`src/app/report/start/page.tsx`）**
  - RepoCaのcontent表示に10文字制限（11文字目以降は「...」に省略）
  - 編集モーダルから作業時間フィールドを削除
- **終業報告（`src/app/report/end/page.tsx`）** — 軽微な修正
- **報告一覧（`src/app/report/page.tsx`）** — 修正
- **RepoCaContext（`src/contexts/RepoCaContext.tsx`）** — 報告日付管理の追加
- **モックデータ（`src/lib/mock-data.ts`）** — データ修正
- **型定義（`src/types/index.ts`）** — 型追加

---

## 2026/03/11 修正履歴

### 1. シーズンパスレイアウト修正 — SeiyaIwatani（13:54）

**コミット:** `dd116d0`

**修正内容:**

- **ホームページ（`src/app/page.tsx`）** — レイアウト調整
- **シーズンパス（`src/app/season-pass/page.tsx`）** — レイアウト修正
- **モックデータ（`src/lib/mock-data.ts`）** — データ修正

---

### 2. UI修正 — kikuchi-hibiki（本日）

**修正内容（コミット未）:**

- **ホームページ（`src/app/page.tsx`）**
  - タスクパネル下部の「今日のミッション」セクションを削除
  - バッジ一覧コンポーネントに `minHeight: 290` を追加
  - ミッションコンポーネントのタブ切り替え（日/月/無期限）を削除し、常にデイリーミッションを表示
  - タイトルを「ミッション」→「デイリーミッション」に変更
  - 不要な `missionTab` / `setMissionTab` state を削除
- **ヘッダー（`src/components/AppHeader.tsx`）**
  - 「報酬交換」「プロジェクト」ナビゲーションボタンを削除

---

## 2026/03/12 修正履歴

### 1. RepoCa新規作成フロー・報告画面改修 — SeiyaIwatani

**修正内容（コミット未）:**

- **RepoCa新規作成（`src/app/repoca/new/page.tsx`）**
  - 「続けて作成」ボタン押下時に遷移せず左パネルに積み上げる動作に変更
  - 「業務報告に追加」ボタンを削除し下部の確定ボタンに統合
  - 下部ボタンラベルを遷移元に応じて「報告に追加」「カードを新規作成」に切り替え
  - `useSearchParams` のバグ修正：`NewRepoCaContent` + Suspenseラッパー (`NewRepoCa`) に分割
- **報告一覧（`src/app/report/page.tsx`）**
  - RepoCa作成リンクを `/repoca/new?from=/report` に変更
- **始業報告（`src/app/report/start/page.tsx`）**
  - RepoCa作成リンクを `/repoca/new?from=/report/start` に変更
  - `useEffect` で `pendingRepoCaIds` を選択済みIDに自動マージしてクリア
  - 「未完了のRepoCa」「お気に入りのRepoCa」にゴミ箱ボタンを追加（削除機能）
  - ツールチップ幅を `200px → 300px` に拡大
- **終業報告（`src/app/report/end/page.tsx`）**
  - RepoCa作成リンクを `/repoca/new?from=/report/end` に変更
  - サイドバー幅を `200px → 300px` に拡大
  - `useEffect` で `pendingRepoCaIds` を自動マージ
  - 「未完了のRepoCa」「お気に入りのRepoCa」にゴミ箱ボタンを追加
- **RepoCaContext（`src/contexts/RepoCaContext.tsx`）**
  - `removeRepoCa(id)`：`allRepoCas` と `todayRepoCas` 両方から削除する機能を追加
  - `pendingRepoCaIds` / `addPendingRepoCaId` / `clearPendingRepoCaIds` を追加（ページ間ID受け渡し）
- **グローバルCSS（`src/app/globals.css`）**
  - `.card` / `.repoca-card` に `overflow: hidden; min-width: 0; word-break: break-word; overflow-wrap: break-word` を追加（テキストはみ出し修正）
  - `.chip` に `max-width: 100%; overflow: hidden; text-overflow: ellipsis` を追加
  - `.repoca-mini` の幅を `min-width: 225px; max-width: 300px` に拡大
  - `.report-layout` の右カラム幅を `260px → 390px` に拡大
