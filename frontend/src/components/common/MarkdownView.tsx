import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string | undefined | null;
  className?: string;
}

/**
 * Full Markdown viewer with styled headings, blockquotes, lists, code blocks,
 * and highlighted bold text (no raw asterisks).
 */
export function MarkdownView({ content, className = "" }: MarkdownProps) {
  if (!content) return null;

  return (
    <div className={`markdown-body space-y-4 text-foreground/90 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-foreground border-b border-border pb-2 mt-6 mb-4 font-display">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-1.5 mt-5 mb-3 font-display">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-primary mt-4 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-foreground mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed mb-3 text-sm text-foreground/90">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground bg-primary/10 px-1 py-0.5 rounded text-primary">
              {children}
            </strong>
          ),
          b: ({ children }) => (
            <strong className="font-bold text-foreground bg-primary/10 px-1 py-0.5 rounded text-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 mb-3 space-y-1.5 text-sm text-foreground/80">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 mb-3 space-y-1.5 text-sm text-foreground/80">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed [&>strong]:text-foreground [&>strong]:bg-transparent [&>strong]:p-0">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-1.5 my-3 bg-card/60 italic text-muted-foreground rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ inline, className: codeClass, children, ...props }: any) => {
            const isInline = inline ?? !String(children).includes("\n");
            if (isInline) {
              return (
                <code
                  className="font-mono text-xs bg-muted/80 text-primary px-1.5 py-0.5 rounded border border-border"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="font-mono text-xs bg-black/60 p-3.5 rounded border border-border overflow-x-auto my-3 text-emerald-400">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-border rounded">
              <table className="min-w-full divide-y divide-border text-xs font-mono">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/40 font-bold text-foreground">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border/50 bg-card/20">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-muted-foreground">{children}</td>
          ),
          hr: () => <hr className="border-border my-6" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Inline Markdown viewer for single-line labels, hints, questions, or descriptions
 * without adding outer paragraph wrappers, ensuring **bold** renders cleanly.
 */
export function InlineMarkdown({ content, className = "" }: MarkdownProps) {
  if (!content) return null;

  return (
    <span className={`inline-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <>{children}</>,
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          b: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">{children}</em>
          ),
          code: ({ children }: any) => (
            <code className="font-mono text-xs bg-muted/80 text-primary px-1 py-0.5 rounded border border-border/80">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </span>
  );
}
