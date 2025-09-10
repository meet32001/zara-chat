import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Send, Square } from "lucide-react";

interface ChatComposerProps {
  onSend: (text: string) => void;
  streaming: boolean;
  onStop: () => void;
}

export function ChatComposer({ onSend, streaming, onStop }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "0px";
    t.style.height = Math.min(180, Math.max(56, t.scrollHeight)) + "px";
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim().length) {
        onSend(value.trim());
        setValue("");
      }
    }
    if (e.key === "Escape") {
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-[hsl(var(--surface-elevated))] supports-[backdrop-filter]:backdrop-blur-sm">
      <div className="mx-auto max-w-[900px] w-full px-3 sm:px-4 py-3 flex items-end gap-2">
        <Button variant="ghost" size="icon" aria-label="Attach">
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message Zara"
            className="w-full resize-none rounded-md border bg-background px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Message input"
          />
        </div>
        <Button variant="ghost" size="icon" aria-label="Voice input (placeholder)">
          <Mic className="h-4 w-4" />
        </Button>
        {streaming ? (
          <Button onClick={onStop} aria-label="Stop" variant="destructive">
            <Square className="h-4 w-4 mr-1" /> Stop
          </Button>
        ) : (
          <Button onClick={() => { if (value.trim()) { onSend(value.trim()); setValue(""); }}} aria-label="Send">
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
        )}
      </div>
    </div>
  );
}
