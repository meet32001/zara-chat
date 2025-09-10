import { useEffect, useMemo, useRef, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/chat/AppHeader";
import { AppSidebar, Conversation } from "@/components/chat/AppSidebar";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatMessage, AssistantActions, Message } from "@/components/chat/ChatMessage";
import { EmptyState } from "@/components/chat/EmptyState";
import { toast } from "@/hooks/use-toast";
import { chatOnce, type Msg } from "@/lib/api";

export default function Index() {
  const [model, setModel] = useState("gemini:gemini-2.0-flash");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>({});
  const [streaming, setStreaming] = useState(false);

  // For stopping streaming fetch
  const abortRef = useRef<AbortController | null>(null);

  // Initialize first conversation
  useEffect(() => {
    if (conversations.length === 0) {
      handleNewChat();
    }
  }, []);

  const activeMessages = useMemo(() => (activeId ? messagesByConv[activeId] ?? [] : []), [messagesByConv, activeId]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, streaming]);

  function handleNewChat() {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: "New Chat",
      updatedAt: Date.now(),
    };
    setConversations((c) => [conv, ...c]);
    setMessagesByConv((m) => ({ ...m, [id]: [] }));
    setActiveId(id);
  }

  function selectConversation(id: string) {
    setActiveId(id);
  }

  function deleteConversation(id: string) {
    setConversations((c) => c.filter((x) => x.id !== id));
    setMessagesByConv((m) => {
      const { [id]: _, ...rest } = m;
      return rest;
    });
    if (activeId === id) {
      setActiveId(null);
    }
  }

  function upsertMessage(convId: string, msg: Message) {
    setMessagesByConv((m) => ({
      ...m,
      [convId]: [...(m[convId] ?? []), msg],
    }));
    setConversations((c) => c.map((x) => (x.id === convId ? { ...x, updatedAt: Date.now() } : x)));
  }

  function updateLastAssistant(convId: string, updater: (m: Message) => Message) {
    setMessagesByConv((m) => {
      const arr = [...(m[convId] ?? [])];
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].role === "assistant") {
          arr[i] = updater(arr[i]);
          break;
        }
      }
      return { ...m, [convId]: arr };
    });
  }

  async function onSend(text: string) {
    if (!activeId) return;

    // 1) push user
    const user: Message = { id: crypto.randomUUID(), role: "user", content: text };
    upsertMessage(activeId, user);

    // 2) show loading assistant bubble
    const assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "", streaming: true };
    upsertMessage(activeId, assistant);
    setStreaming(true);

    try {
      // 3) Call backend with selected provider:model
      const messages: Msg[] = [
        { role: "system", content: "You are Zara, concise and helpful." },
        { role: "user", content: text },
      ];

      const res = await chatOnce({
        messages,
        selected: model,      // <-- send "provider:modelId"
        temperature: 0.7,
      });

      updateLastAssistant(activeId, (m) => ({ ...m, content: res.content, streaming: false }));
    } catch (e: any) {
      const msg = e?.message || "Chat failed";
      console.error("chatOnce error:", e);
      updateLastAssistant(activeId, (m) => ({ ...m, content: `⚠️ ${msg}`, streaming: false }));
      toast({ title: "Chat failed", description: msg });
    } finally {
      setStreaming(false);
    }
  }

  function onStop() {
    setStreaming(false);
    abortRef.current?.abort();
    abortRef.current = null;
  }

  function onCopyLast() {
    const last = [...activeMessages].reverse().find((m) => m.role === "assistant");
    if (last) {
      navigator.clipboard.writeText(last.content);
      toast({ title: "Copied response" });
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppHeader onNewChat={handleNewChat} model={model} setModel={setModel} />
        <AppSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onDelete={deleteConversation}
        />

        <SidebarInset>
          <h1 className="sr-only">Zara Chat — Modern Chatbot</h1>
          <div className="pt-14" />
          <section aria-label="Chat" className="mx-auto max-w-[920px] px-3 sm:px-4 pb-36">
            {activeMessages.length === 0 ? (
              <EmptyState onUsePrompt={(p) => onSend(p)} />
            ) : null}

            <div className="flex flex-col gap-3">
              {activeMessages.map((m) => (
                <div key={m.id}>
                  <ChatMessage message={m} />
                  {m.role === "assistant" && !m.streaming && (
                    <AssistantActions
                      onCopy={() => navigator.clipboard.writeText(m.content)}
                      onRegenerate={() => onSend("Regenerate the previous answer succinctly.")}
                      onSummarize={() => onSend("Summarize the above in bullet points.")}
                    />
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </section>

          <ChatComposer onSend={onSend} streaming={streaming} onStop={onStop} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
