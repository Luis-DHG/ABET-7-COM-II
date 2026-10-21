import { Component } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Link } from "react-router-dom";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { MODULES } from "@/lib/manifest";

type MessageProps = { content: string };
type RenderState = { content: string; failed: boolean };

const components = {
  a({ href, title, children }) {
    // Compare the original path, without normalizing near-matches into a module.
    const path = href?.split(/[?#]/u, 1)[0];
    const isModule = MODULES.some((module) => module.path === path);
    const className = "text-primary underline underline-offset-4 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

    return isModule && href ? (
      <Link to={href} title={title} className={className}>{children}</Link>
    ) : (
      <a href={href} title={title} className={className}>{children}</a>
    );
  },
  // Message headings sit below the panel title, not at page-title level.
  h1: "h3",
  h2: "h4",
  h3: "h5",
  h4: "h6",
  h5: "h6",
  h6: "h6",
  pre({ children }) {
    return (
      <pre tabIndex={0} aria-label="Bloque de código" className="max-w-full overflow-x-auto rounded-md bg-muted p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {children}
      </pre>
    );
  },
} satisfies Components;

class MessageRenderer extends Component<MessageProps, RenderState> {
  state: RenderState = { content: this.props.content, failed: false };

  static getDerivedStateFromError(): Partial<RenderState> {
    return { failed: true };
  }

  static getDerivedStateFromProps({ content }: MessageProps, state: RenderState): RenderState | null {
    // Retry on the next fragment without remounting links on every streamed token.
    return content === state.content ? null : { content, failed: false };
  }

  render() {
    const { content } = this.props;
    if (this.state.failed) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { trust: false, output: "mathml" }]]}
        skipHtml
        disallowedElements={["img"]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    );
  }
}

export function ChatMessage({ content }: { content: string }) {
  return (
    <div className="chat-message min-w-0 max-w-full space-y-3 overflow-x-auto wrap-anywhere font-sans text-sm leading-relaxed text-foreground [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:font-mono [&_h3]:text-base [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_hr]:border-border [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
      <MessageRenderer content={content} />
    </div>
  );
}
