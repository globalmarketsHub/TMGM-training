type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "checklist"; items: string[] }
  | { type: "image"; src: string; alt?: string }
  | { type: "link"; href: string; text: string };

function getBlocks(content: unknown): ContentBlock[] {
  if (!content || typeof content !== "object") return [];
  const maybeBlocks = (content as { blocks?: unknown }).blocks;
  return Array.isArray(maybeBlocks) ? (maybeBlocks as ContentBlock[]) : [];
}

export function ContentRenderer({ content }: { content: unknown }) {
  const blocks = getBlocks(content);

  if (!blocks.length) {
    return (
      <div className="surface rounded-lg p-5 text-sm leading-7 text-blue-100">
        课程内容模板为空。管理员可以在课程内容后台填写文字、图片、视频、PDF 或链接。
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2 key={index} className="text-xl font-black text-white">
              {block.text}
            </h2>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="text-sm leading-7 text-blue-100 md:text-base">
              {block.text}
            </p>
          );
        }

        if (block.type === "checklist") {
          return (
            <ul key={index} className="grid gap-3 sm:grid-cols-2">
              {block.items.map((item) => (
                <li key={item} className="surface rounded-lg px-4 py-3 text-sm font-semibold text-blue-50">
                  <span className="mr-2 text-bridge-cyan">•</span>
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "image") {
          return (
            <img
              key={index}
              src={block.src}
              alt={block.alt ?? ""}
              className="w-full rounded-lg border border-white/10 object-cover"
            />
          );
        }

        if (block.type === "link") {
          return (
            <a key={index} className="btn-secondary" href={block.href} target="_blank" rel="noreferrer">
              {block.text}
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}
