interface LabInstructionsProps {
  instructions: string;
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("``") && part.endsWith("``")) {
      return <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary border border-slate-200">{part.slice(1, -1)}</code>;
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index} className="italic text-slate-600">{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary border border-slate-200">{part.slice(1, -1)}</code>;
    }

    return <span key={index}>{part}</span>;
  });
}

export default function LabInstructions({ instructions }: LabInstructionsProps) {
  const lines = instructions ? instructions.split(/\r?\n/) : [];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
      <h2 className="mb-5 text-xl font-bold text-slate-900">Lab Instructions</h2>

      <div className="space-y-4 text-slate-700 leading-relaxed">
        {lines.length === 0 ? (
          <p className="text-sm text-slate-500">No instructions provided yet.</p>
        ) : (
          lines.map((line, index) => {
            if (!line.trim()) {
              return <div key={index} className="h-2" />;
            }

            if (line.startsWith("### ")) {
              return <h3 key={index} className="mt-4 text-base font-bold text-slate-900">{line.replace("### ", "")}</h3>;
            }

            if (line.startsWith("## ")) {
              return <h2 key={index} className="mt-5 text-lg font-bold text-slate-900">{line.replace("## ", "")}</h2>;
            }

            if (line.startsWith("- ")) {
              return (
                <li key={index} className="ml-5 list-disc text-slate-700">
                  {renderInline(line.replace("- ", ""))}
                </li>
              );
            }

            if (line.startsWith("```")) {
              return (
                <pre key={index} className="overflow-x-auto rounded-xl bg-slate-950 p-4 font-mono text-sm text-emerald-400 border border-slate-850">
                  <code>{line.replace(/```/g, "")}</code>
                </pre>
              );
            }

            return <p key={index}>{renderInline(line)}</p>;
          })
        )}
      </div>
    </div>
  );
}
