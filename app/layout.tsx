import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TMGM Chelsea Training",
  description: "Employee training CRM with active learning time tracking"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
