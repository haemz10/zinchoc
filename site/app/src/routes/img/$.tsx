import { createFileRoute } from "@tanstack/react-router";

import { getBucket } from "../../lib/data.server";

// Public image route. Streams objects from R2 (product photos and site images
// uploaded via admin) with a long cache. Served at /img/<key...>.

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const Route = createFileRoute("/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const key = (params as { _splat?: string })._splat ?? "";
        if (!key || key.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        const bucket = getBucket();
        if (!bucket) return new Response("Not found", { status: 404 });

        const object = await bucket.get(key);
        if (!object) return new Response("Not found", { status: 404 });

        const ext = key.split(".").pop()?.toLowerCase() ?? "";
        const contentType =
          object.httpMetadata?.contentType ?? CONTENT_TYPES[ext] ?? "application/octet-stream";

        return new Response(object.body as unknown as BodyInit, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": String(object.size),
          },
        });
      },
    },
  },
});
