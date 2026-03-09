"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { Components } from "react-markdown";

function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  const render = useCallback(async () => {
    try {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          darkMode: true,
          background: "#1a1a2e",
          primaryColor: "#6366f1",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#4f46e5",
          lineColor: "#64748b",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontSize: "14px",
        },
      });
      const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
      const { svg: rendered } = await mermaid.render(id, chart);
      setSvg(rendered);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to render diagram");
    }
  }, [chart]);

  useEffect(() => { render(); }, [render]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
        <p className="font-medium mb-1">Diagram error</p>
        <pre className="text-xs opacity-70 whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return <div className="py-8 text-center text-sm text-muted">Rendering diagram...</div>;
  }

  return (
    <div
      ref={containerRef}
      className="md-mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    const isInline = !className && !codeString.includes("\n");

    if (isInline) {
      return (
        <code className="md-inline-code" {...props}>
          {children}
        </code>
      );
    }

    if (match?.[1] === "mermaid") {
      return <MermaidBlock chart={codeString} />;
    }

    return (
      <SyntaxHighlighter
        style={oneDark}
        language={match?.[1] || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          fontSize: "0.85rem",
          lineHeight: 1.6,
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    );
  },
  table({ children }) {
    return (
      <div className="md-table-wrap">
        <table>{children}</table>
      </div>
    );
  },
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <article className="md-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
