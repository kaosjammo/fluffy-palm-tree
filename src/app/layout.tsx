import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snapframe",
  description: "Turn raw screenshots into polished mockups in under 30 seconds.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
