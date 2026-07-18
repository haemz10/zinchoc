import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Coterie — Member-owned communities",
    short_name: "Coterie",
    description:
      "A member-owned home for niche communities. No algorithm. Just members.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eee6d8",
    theme_color: "#241f18",
    categories: ["social", "lifestyle", "shopping"],
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
    shortcuts: [
      {
        name: "Messages",
        short_name: "Messages",
        url: "/messages",
      },
      {
        name: "New community",
        short_name: "Create",
        url: "/communities/new",
      },
    ],
  };
}
