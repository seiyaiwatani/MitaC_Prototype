export type TaskType = "開発" | "実装" | "MTG" | "デイリースクラム" | "その他";
export type TaskLabel = "新規作成" | "修正" | "調査" | "レビュー" | "その他";
export type ImplScope = "フロント" | "バック" | "インフラ" | "フルスタック" | "その他";
export type ReportType = "始業" | "終業" | "残業";

export interface Project {
  id: string;
  name: string;
  teamId: string;
  color: string;   // bg color for PJ group
  textColor: string;
  icon: string;
}

export interface RepoCa {
  id: string;
  projectId: string;
  taskType: TaskType;
  label: TaskLabel;
  implScope: ImplScope;
  content: string;
  isFavorite: boolean;
  isCompleted: boolean;
  duration: number; // minutes
  xp: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  teamId: string;
  level: number;
  xp: number;
  xpToNext: number;
  currency: number;
  avatar: string;
  isExternal: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  acquired: boolean;
  acquiredAt?: string;
}

export interface Mission {
  id: string;
  type: "daily" | "monthly" | "unlimited";
  title: string;
  description: string;
  reward: number;
  progress: number;
  goal: number;
  completed: boolean;
}

export interface DailyReport {
  id: string;
  userId: string;
  date: string;
  type: ReportType;
  repoCas: string[];
  submittedAt: string;
  overtime?: boolean;
  overtimeHours?: number;
  overtimeContent?: string;
}
