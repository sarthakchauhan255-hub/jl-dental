/**
 * Renders a blog post's plain-text `content` as a structured, readable article.
 *
 * Processes the text line-by-line so structural lines are always recognised,
 * even when the author omitted a blank line before them:
 *   • "1. Title" / "2. Title" …           → section heading (breaks out of a list)
 *   • a line ending in "?"                 → heading (e.g. "What Causes Cavities?")
 *   • a lone short Title-case line          → heading (e.g. "Final Thoughts")
 *   • a line ending in ":"                  → lead-in above a list
 *   • a run of short lines (no full stop)   → bulleted list
 *   • everything else                       → paragraph
 */
type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string; lead?: boolean }
  | { kind: "list"; items: string[] };

const HEADING_MAX = 72;
const LIST_MAX = 60;
const SINGLE_HEADING_MAX = 52;

function parse(content: string): Block[] {
  const out: Block[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    if (list.length === 1) {
      const only = list[0];
      out.push(
        only.length <= SINGLE_HEADING_MAX
          ? { kind: "heading", text: only }
          : { kind: "paragraph", text: only },
      );
    } else {
      out.push({ kind: "list", items: list });
    }
    list = [];
  };

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();

    if (!line) { flushList(); continue; }

    // numbered section heading — always a heading, never a list item
    if (/^\d+\.\s+\S/.test(line) && line.length <= HEADING_MAX) {
      flushList();
      out.push({ kind: "heading", text: line });
      continue;
    }
    // question heading
    if (line.endsWith("?") && line.length <= HEADING_MAX) {
      flushList();
      out.push({ kind: "heading", text: line });
      continue;
    }
    // lead-in that introduces a list
    if (line.endsWith(":") && line.length <= LIST_MAX) {
      flushList();
      out.push({ kind: "paragraph", text: line, lead: true });
      continue;
    }
    // list item — short and not ending in a full stop
    if (line.length <= LIST_MAX && !/[.]$/.test(line)) {
      list.push(line);
      continue;
    }
    // paragraph
    flushList();
    out.push({ kind: "paragraph", text: line });
  }
  flushList();
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

  return (
    <div className="body-base">
      {parse(content).map((block, i) => {
        if (block.kind === "heading") {
          return (
            <h2 key={i} className="heading-4 mb-3 mt-9 text-primary-900 first:mt-0">
              {block.text}
            </h2>
          );
        }
        if (block.kind === "list") {
          return <Bullets key={i} items={block.items} />;
        }
        return (
          <p
            key={i}
            className={`${block.lead ? "mb-2" : "mb-6"} whitespace-pre-line leading-relaxed text-charcoal-700`}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
