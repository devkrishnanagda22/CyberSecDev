import type { ReactNode } from "react";

interface LessonContentProps {
  content: string;
  lessonTitle?: string;
}

export default function LessonContent({
  content,
  lessonTitle,
}: LessonContentProps) {
  if (!content.trim()) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-slate-500 shadow-xs">
        {lessonTitle
          ? `Learning material for ${lessonTitle} has not been published yet.`
          : "No lesson content available."}
      </div>
    );
  }

  const lines = content.split("\n");
  const contentBlocks: ReactNode[] = [];
  let codeLines: string[] | null = null;
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let listStartIndex = 0;

  function flushList() {
    if (!listType) return;

    const List = listType;
    contentBlocks.push(
      <List
        key={`list-${listStartIndex}`}
        className={`ml-6 list-inside ${listType === "ul" ? "list-disc" : "list-decimal"} text-slate-700 space-y-1`}
      >
        {listItems.map((item, index) => (
          <li key={`${listStartIndex}-${index}`}>{item}</li>
        ))}
      </List>
    );
    listType = null;
    listItems = [];
  }

  for (const [index, line] of lines.entries()) {
    const text = line.trim();

    if (codeLines !== null) {
      if (text.startsWith("```")) {
        contentBlocks.push(
          <pre
            key={`code-${index}`}
            className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm text-emerald-400 border border-slate-850"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = null;
        continue;
      }

      codeLines.push(line);
      continue;
    }

    if (text.startsWith("```")) {
      flushList();
      codeLines = [];
      continue;
    }

    const unorderedItem = text.startsWith("- ") ? text.slice(2) : null;
    const orderedItem = /^\d+\.\s/.test(text) ? text.replace(/^\d+\.\s/, "") : null;
    const nextListType = unorderedItem !== null ? "ul" : orderedItem !== null ? "ol" : null;

    if (nextListType) {
      if (listType !== nextListType) {
        flushList();
        listType = nextListType;
        listStartIndex = index;
      }
      listItems.push(unorderedItem ?? orderedItem ?? "");
      continue;
    }

    flushList();

    if (!text) {
      contentBlocks.push(<div key={index} className="h-3" />);
    } else if (text.startsWith("# ")) {
      contentBlocks.push(
        <h2 key={index} className="mt-8 text-2xl font-bold text-slate-900">
          {text.slice(2)}
        </h2>
      );
    } else if (text.startsWith("## ")) {
      contentBlocks.push(
        <h3 key={index} className="mt-6 text-xl font-bold text-slate-900">
          {text.slice(3)}
        </h3>
      );
    } else if (text.startsWith("### ")) {
      contentBlocks.push(
        <h4 key={index} className="mt-5 text-lg font-semibold text-slate-800">
          {text.slice(4)}
        </h4>
      );
    } else if (text.startsWith("`") && text.endsWith("`")) {
      contentBlocks.push(
        <pre
          key={index}
          className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm text-emerald-400 border border-slate-850"
        >
          <code>{text.slice(1, -1)}</code>
        </pre>
      );
    } else if (text.startsWith(">")) {
      contentBlocks.push(
        <blockquote
          key={index}
          className="border-l-4 border-primary pl-4 italic text-slate-600 my-2"
        >
          {text.slice(1).trimStart()}
        </blockquote>
      );
    } else {
      contentBlocks.push(<p key={index}>{text}</p>);
    }
  }

  flushList();

  if (codeLines !== null) {
    contentBlocks.push(
      <pre key="unclosed-code" className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm text-emerald-400 border border-slate-850">
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
      <h2 className="mb-6 text-xl font-bold text-slate-900">
        Lesson Content
      </h2>

      <div className="space-y-4 text-slate-700 leading-relaxed">
        {contentBlocks}
      </div>
    </div>
  );
}