import type { Metadata, Viewport } from "next";
import { Anton, Inter } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Highgrade Haulers Solutions", template: "%s" },
  applicationName: "Highgrade Haulers Solutions",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#111512", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
