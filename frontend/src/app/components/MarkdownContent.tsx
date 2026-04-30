import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { LazyImage } from "./LazyImage";
import { HeadingIdGenerator } from "../utils/headingId";

interface MarkdownContentProps {
  content: string;
}

function extractText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (React.isValidElement(child)) {
        return extractText((child.props as { children?: React.ReactNode }).children);
      }
      return "";
    })
    .join("");
}

const HEADING_CLASSES: Record<number, string> = {
  1: "text-3xl font-bold mt-8 mb-4 first:mt-0",
  2: "text-2xl font-semibold mt-6 mb-3",
  3: "text-xl font-semibold mt-5 mb-2",
  4: "text-lg font-semibold mt-4 mb-2",
  5: "text-base font-semibold mt-3 mb-2",
  6: "text-sm font-semibold mt-3 mb-1 text-gray-700",
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  const generator = useRef(new HeadingIdGenerator());

  useEffect(() => {
    generator.current.reset();
  }, [content]);

  const headingRenderer = (level: number, className: string) =>
    function Heading({ children }: { children?: React.ReactNode }) {
      const text = extractText(children);
      const id = generator.current.generate(text);
      const cn = HEADING_CLASSES[level] ?? className;
      switch (level) {
        case 1: return <h1 id={id} className={cn}>{children}</h1>;
        case 2: return <h2 id={id} className={cn}>{children}</h2>;
        case 3: return <h3 id={id} className={cn}>{children}</h3>;
        case 4: return <h4 id={id} className={cn}>{children}</h4>;
        case 5: return <h5 id={id} className={cn}>{children}</h5>;
        default: return <h6 id={id} className={cn}>{children}</h6>;
      }
    };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          h1: headingRenderer(1, ""),
          h2: headingRenderer(2, ""),
          h3: headingRenderer(3, ""),
          h4: headingRenderer(4, ""),
          h5: headingRenderer(5, ""),
          h6: headingRenderer(6, ""),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-gray-700">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 italic text-gray-700 bg-blue-50">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            if (isInline) {
              return (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600">
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="mb-4 p-4 bg-[#f6f8fa] rounded-lg overflow-x-auto">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt, ...props }) => (
            <LazyImage
              src={src}
              alt={alt}
              className="mb-4 rounded-lg max-w-full h-auto"
              {...props}
            />
          ),
          table: ({ children }) => (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700">{children}</td>
          ),
          hr: () => <hr className="my-8 border-gray-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
