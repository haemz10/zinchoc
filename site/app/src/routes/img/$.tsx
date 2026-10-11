import { createFileRoute } from "@tanstack/react-router";

import { getBucket } from "../../lib/data.server";

// Public media route. Streams objects from R2 (product/site/gallery photos and
// video clips uploaded via admin) with a long cache. Served at /img/<key...>.
// Supports HTTP Range requests so browsers can seek and reliably play video.

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export const Route = createFileRoute("/img/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const key = (params as { _splat?: string })._splat ?? "";
        if (!key || key.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        const bucket = getBucket();
        if (!bucket) return new Response("Not found", { status: 404 });

        const ext = key.split(".").pop()?.toLowerCase() ?? "";

        // Honour a Range request (video seeking; Safari requires it to play
        // <video> at all). Fall back to the whole object when absent.
        const range = parseRange(request.headers.get("range"));
        const object = await bucket.get(key, range ? { range } : undefined);
        if (!object) return new Response("Not found", { status: 404 });

        const contentType =
          object.httpMetadata?.contentType ?? CONTENT_TYPES[ext] ?? "application/octet-stream";
        const cache = "public, max-age=31536000, immutable";

        const objRange = object.range as { offset?: number; length?: number } | undefined;
        if (range && objRange) {
          const offset = objRange.offset ?? 0;
          const length = objRange.length ?? object.size - offset;
          const end = offset + length - 1;
          return new Response(object.body as unknown as BodyInit, {
            status: 206,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": cache,
              "Accept-Ranges": "bytes",
              "Content-Range": `bytes ${offset}-${end}/${object.size}`,
              "Content-Length": String(length),
            },
          });
        }

        return new Response(object.body as unknown as BodyInit, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": cache,
            "Accept-Ranges": "bytes",
            "Content-Length": String(object.size),
          },
        });
      },
    },
  },
});

/** Parse a single "bytes=start-end" range header into an R2 range option.
 * Suffix ranges and multi-ranges fall back to the whole object. */
function parseRange(header: string | null): { offset: number; length?: number } | undefined {
  if (!header) return undefined;
  const match = /^bytes=(\d+)-(\d*)$/.exec(header.trim());
  if (!match) return undefined;
  const offset = Number.parseInt(match[1], 10);
  if (!Number.isFinite(offset)) return undefined;
  if (match[2] === "") return { offset };
  const end = Number.parseInt(match[2], 10);
  if (!Number.isFinite(end) || end < offset) return { offset };
  return { offset, length: end - offset + 1 };
}
