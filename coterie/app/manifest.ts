import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Coterie — Member-owned communities",
    short_name: "Coterie",
    description:
      "A member-owned home for niche communities. No algorithm. Just members.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#1c1a17",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
