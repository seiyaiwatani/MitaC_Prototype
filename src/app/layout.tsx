import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AppShell } from "@/components/AppShell";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
      <body className={`antialiased ${notoSansJP.className}`}>
        <div className="app-container">
          <AppShell>{children}</AppShell>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
