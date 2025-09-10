import { Copy, RefreshCw, Sparkles } from "lucide-react";
import copy from "copy-to-clipboard";
import { toast } from "@/hooks/use-toast";
import { Highlight, themes } from "prism-react-renderer";
import { Button } from "@/components/ui/button";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  imageUrl?: string;
};

function CodeBlock({ code, language = "tsx" }: { code: string; language?: string }) {
  return (
    <div className="relative group">
      <Button
        aria-label="Copy code"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => {
          copy(code);
          toast({ title: "Code copied" });
        }}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Highlight theme={themes.nightOwl} code={code} language={language as any}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} rounded-md p-4 overflow-x-auto`} style={style as any}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const bubbleBase = "rounded-2xl px-4 py-3 text-sm";
  const bubbleClass = isUser
    ? `bg-[hsl(var(--bubble-user))] text-[hsl(var(--primary-foreground))]`
    : `bg-[hsl(var(--bubble-assistant))]`;

  const container = isUser ? "justify-end" : "justify-start";

  const maybeCode = message.content.startsWith("```") && message.content.endsWith("```");
  let codeContent: string | null = null;
  let language = "tsx";
  if (maybeCode) {
    const inner = message.content.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
    const langMatch = message.content.match(/^```(\w+)/);
    language = langMatch?.[1] ?? "tsx";
    codeContent = inner;
  }

  return (
    <div className={`flex ${container} animate-fade-in`}> 
      <div
        className={`${bubbleBase} ${bubbleClass} max-w-[80%] md:max-w-[760px]`}
        aria-live={message.streaming ? "polite" : undefined}
      >
        {message.streaming ? (
          <div className="relative">
            <div className="h-5 w-28 rounded shimmer-bg animate-shimmer" />
          </div>
        ) : codeContent ? (
          <CodeBlock code={codeContent} language={language} />
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );
}

export function AssistantActions({ onCopy, onRegenerate, onSummarize }: { onCopy: () => void; onRegenerate: () => void; onSummarize: () => void; }) {
  return (
    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Copy" onClick={onCopy}>
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Regenerate" onClick={onRegenerate}>
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Summarize" onClick={onSummarize}>
        <Sparkles className="h-4 w-4" />
      </Button>
    </div>
  );
}
