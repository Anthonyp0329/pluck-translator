import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Pluck — Your Word Collection",
  description: "Review and quiz your saved translations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--ink)", color: "var(--text)", minHeight: "100vh" }}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
