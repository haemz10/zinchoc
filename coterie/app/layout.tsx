import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
import { PwaInstall } from "@/components/pwa-install";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

// Self-hosted via next/font: fonts are downloaded at build time and served
// from our own origin — no runtime request to Google, no layout shift.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Coterie — Communities where members share, make, and trade",
  description:
    "Coterie is a member-owned home for niche communities. Find your people or build a space of your own — no algorithm, just photos, stories, and small-batch goods from members across every community.",
  openGraph: {
    title: "Coterie — Member-owned communities, beautifully quiet",
    description:
      "Find your people or build a space that's entirely your own. Share photos and stories, and trade small-batch goods across every community.",
    type: "website",
    images: [{ url: "/img/post-p1.jpg", width: 600, height: 780 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coterie — Member-owned communities, beautifully quiet",
    description:
      "Find your people or build a space that's entirely your own. No algorithm. Just members.",
    images: ["/img/post-p1.jpg"],
  },
  // Makes iOS treat Coterie as an installable app ("Add to Home Screen").
  appleWebApp: {
    capable: true,
    title: "Coterie",
    statusBarStyle: "default",
  },
  applicationName: "Coterie",
  manifest: "/manifest.webmanifest",
  icons: {
    // Home-screen icon for iOS when installed via "Add to Home Screen".
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#241f18",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      {/* pb keeps content clear of the mobile bottom tab bar */}
      <body className="pb-14 md:pb-0">
        {children}
        <BottomNav />
        <PwaInstall />
      </body>
    </html>
  );
}
