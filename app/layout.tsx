import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "翻譯機 - 中文-自製粵語拼音翻譯",
  description: "智慧型資料庫驅動系統翻譯中文-自製粵語拼音翻譯",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Navigation />
          <main className="container mx-auto py-8 px-4">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
