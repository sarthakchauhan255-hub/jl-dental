import { Fragment } from "react";

/**
 * Renders a blog post's plain-text `content` as a structured, readable article.
 * Heuristics (conservative — falls back to paragraphs when unsure):
 *   • "1. Title", "2. Title" …        → section heading
 *   • a short line ending in "?"      → heading (e.g. FAQ / "What Causes Cavities?")
 *   • a short Title-Case line          → heading (e.g. "Final Thoughts")
 *   • a run of short lines (no period) → bulleted list
 *   • "Lead-in:" + short lines         → lead paragraph + bulleted list
 *   • everything else                  → paragraph
 */
type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "listWithLead"; lead: string; items: string[] };

const isListLine = (l: string) => l.length <= 60 && !/[.]$/.test(l);

function parse(content: string): Block[] {
  const raw = content.split(/\n\s*\n/).map((b) => b.replace(/\s+$/g, "")).filter((b) => b.trim().length > 0);
  const out: Block[] = [];

  for (const chunk of raw) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 1) {
      const line = lines[0];
      if (/^\d+\.\s+\S/.test(line) && line.length <= 72) { out.push({ kind: "heading", text: line }); continue; }
      if (line.length <= 64 && line.endsWith("?")) { out.push({ kind: "heading", text: line }); continue; }
      if (line.length <= 44 && /^[A-Z0-9]/.test(line) && !/[.,;:]$/.test(line)) { out.push({ kind: "heading", text: line }); continue; }
      out.push({ kind: "paragraph", text: line });
      continue;
    }

    const [first, ...rest] = lines;
    if (first.endsWith(":") && rest.length >= 2 && rest.every(isListLine)) {
      out.push({ kind: "listWithLead", lead: first, items: rest });
      continue;
    }
    if (lines.length >= 2 && lines.every(isListLine)) {
      out.push({ kind: "list", items: lines });
      continue;
    }
    out.push({ kind: "paragraph", text: lines.join("\n") });
  }

  return out;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mb-6 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed text-charcoal-700">
          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[hsl(var(--accent-cyan))]" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ArticleBody({ content }: { content: string }) {
  if (!content?.trim()) return null;
  const blocks = parse(content);

  return (
    <div className="body-base">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h2 key={i} className="heading-4 mb-3 mt-9 text-primary-900 first:mt-0">
                {block.text}
              </h2>
            );
          case "list":
            return <Bullets key={i} items={block.items} />;
          case "listWithLead":
            return (
              <Fragment key={i}>
                <p className="mb-3 leading-relaxed text-charcoal-700">{block.lead}</p>
                <Bullets items={block.items} />
              </Fragment>
            );
          default:
            return (
              <p key={i} className="mb-6 whitespace-pre-line leading-relaxed text-charcoal-700">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
