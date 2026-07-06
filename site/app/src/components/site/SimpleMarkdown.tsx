import { Fragment } from "react";

import type { Settings } from "../../lib/types";
import { H2, P, UL } from "./PageShell";

// Tiny hand-rolled renderer for owner-edited legal copy. Supports exactly:
// "## " section headings, "- " list items (grouped), blank-line paragraphs and
// **bold** spans. Everything is rendered through React text nodes, never
// dangerouslySetInnerHTML, so raw HTML in the stored body stays inert text.
// {{abn}} and {{contact_email}} tokens are replaced from settings at render.

export function replaceTokens(text: string, settings: Settings): string {
  return text
    .replaceAll("{{abn}}", settings.abn)
    .replaceAll("{{contact_email}}", settings.contact_email);
}

/** Split a line on **bold** markers into text and <strong> nodes. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

type Block =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: "ul", items: list });
      list = [];
    }
  };

  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function SimpleMarkdown({ body, settings }: { body: string; settings: Settings }) {
  const blocks = parseBlocks(replaceTokens(body, settings));
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "h2") return <H2 key={i}>{inline(block.text)}</H2>;
        if (block.kind === "ul") {
          return (
            <UL key={i}>
              {block.items.map((item, j) => (
                <li key={j}>{inline(item)}</li>
              ))}
            </UL>
          );
        }
        return <P key={i}>{inline(block.text)}</P>;
      })}
    </>
  );
}
