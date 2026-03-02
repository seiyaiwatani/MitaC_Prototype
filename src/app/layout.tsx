import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Mita=C",
  description: "ゲーミフィケーション×業務報告システム",
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
          <AppHeader />
          <div className="page-content">
            {children}
          </div>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
