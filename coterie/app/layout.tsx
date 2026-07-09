import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coterie — Ad-free communities where members share, make, and trade",
  description:
    "Coterie is a member-owned home for niche communities. Find your people or build a space of your own — no ads, no algorithms, just photos, stories, and small-batch goods from members across every community.",
  openGraph: {
    title: "Coterie — Ad-free communities, beautifully quiet",
    description:
      "Find your people or build a space that's entirely your own. Share photos and stories, and trade small-batch goods across every community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
