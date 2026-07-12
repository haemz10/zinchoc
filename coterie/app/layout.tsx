import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
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

// On Vercel, VERCEL_URL is set automatically; override with NEXT_PUBLIC_SITE_URL
// once a custom domain exists.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
