import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Mita=C",
  description: "ゲーミフィケーション×タスク管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <div className="app-container">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
