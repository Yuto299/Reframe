import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/presentation/components/layout/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Knowledge Connection - 知識をつなげる",
  description: "過去の知識をAIで検索し、つなげて可視化するアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
