import { MDXComponents as MDXComponentsType } from "mdx/types";

export const MDXComponents: MDXComponentsType = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-medium mb-6 mt-8">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-medium mb-4 mt-6">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium mb-3 mt-4">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-4 text-[var(--foreground)]/80">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-sm leading-relaxed mb-4 ml-4 list-disc space-y-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-sm leading-relaxed mb-4 ml-4 list-decimal space-y-2">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-[var(--foreground)]/80">{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="underline underline-offset-2 hover:opacity-60 transition-smooth"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[var(--foreground)]/20 pl-4 italic text-sm text-[var(--foreground)]/60 my-4">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="bg-[var(--foreground)]/10 px-1.5 py-0.5 text-xs font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-[var(--foreground)]/5 p-4 overflow-x-auto text-xs font-mono my-4 border border-[var(--foreground)]/10">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-[var(--foreground)]/10 my-8" />,
};
