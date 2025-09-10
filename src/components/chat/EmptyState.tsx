import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function EmptyState({ onUsePrompt }: { onUsePrompt: (text: string) => void }) {
  const prompts = [
    "Explain a concept in simple terms",
    "Summarize this text",
    "Generate ideas for a project",
  ];
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in">
      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full flex items-center justify-center bg-secondary">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold mb-1">Welcome to Zara Chat</h1>
        <p className="text-muted-foreground mb-6">Your AI assistant, ready to help</p>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[640px]">
          {prompts.map((p) => (
            <Button key={p} variant="pill" onClick={() => onUsePrompt(p)}>{p}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}
