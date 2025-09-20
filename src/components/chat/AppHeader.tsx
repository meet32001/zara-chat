import { useEffect } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface AppHeaderProps {
  onNewChat: () => void;
  model: string;
  setModel: (m: string) => void;
}

export function AppHeader({ onNewChat, model, setModel }: AppHeaderProps) {
  useEffect(() => {
    if (!model || !model.includes(":")) {
      setModel("gemini:gemini-2.0-flash");
    }
  }, [model, setModel]);
  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b bg-[hsl(var(--surface-elevated))] supports-[backdrop-filter]:backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-3 sm:px-4 h-14 flex items-center gap-2">
        <SidebarTrigger className="mr-1" />
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Zara Chat</span>
        </div>

        <div className="flex-1" />

        <Button onClick={onNewChat} className="hidden sm:inline-flex">
          New Chat
        </Button>

        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini:gemini-1.5-flash">
              Gemini 1.5 Flash
            </SelectItem>
            <SelectItem value="gemini:gemini-2.0-flash">Gemini 2.0</SelectItem>
            <SelectItem value="gemini:gemini-1.5-pro">
              Gemini 1.5 Pro11
            </SelectItem>

            <SelectItem value="deepseek:deepseek-chat">
              DeepSeek Chat
            </SelectItem>
            <SelectItem value="deepseek:deepseek-coder">
              DeepSeek Coder
            </SelectItem>

            <SelectItem value="groq:llama-3.1-8b-instant">
              Llama 3.1 8B (Instant)
            </SelectItem>
            <SelectItem value="groq:llama-3.3-70b-versatile">
              Llama 3.3 70B (Versatile)
            </SelectItem>
          </SelectContent>
        </Select>

        <ThemeToggle />
      </div>
    </header>
  );
}
