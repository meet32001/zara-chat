// src/lib/api.ts

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

export type Provider = "gemini" | "deepseek" | "groq";
export type Msg = { role: "user" | "assistant" | "system"; content: string };

export type ChatResponse = {
  provider: Provider;
  model: string;
  content: string;
  usage?: Record<string, any> | null;
  latency_ms: number;
};

/**
 * Heuristic to derive provider from a model id when the value is a single string.
 * Supports values like:
 *  - "gemini:gemini-2.0-flash"
 *  - "deepseek:deepseek-chat"
 *  - "groq:llama3-8b-8192"
 *  - or just the raw model id (we infer provider by substring)
 */
function splitProviderModel(selectedOrModel: string): {
  provider: Provider;
  model: string;
} {
  const s = (selectedOrModel || "").trim();
  if (s.includes(":")) {
    const [p, m] = s.split(":");
    return { provider: p as Provider, model: m };
  }
  // Infer if only model was provided
  if (s.startsWith("deepseek")) return { provider: "deepseek", model: s };
  if (s.includes("llama-3.1") || s.includes("llama-3.3")) {
    return { provider: "groq", model: s };
  }
  return { provider: "gemini", model: s || "gemini-2.0-flash" };
}

/**
 * One-shot chat call to FastAPI `/api/chat`.
 * `selected` can be either "provider:modelId" or a raw model id (provider inferred).
 */
export async function chatOnce(req: {
  messages: Msg[];
  selected: string; // e.g. "groq:llama3-8b-8192" or "gemini-2.0-flash"
  temperature?: number;
}): Promise<ChatResponse> {
  const { provider, model } = splitProviderModel(req.selected);

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      model,
      temperature: req.temperature ?? 0.7,
      messages: req.messages,
    }),
  });

  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`Chat failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as ChatResponse;
  return data;
}

/**
 * Compatibility streaming wrapper: our backend doesn't stream yet, so we
 * perform a single call to `/api/chat` and emit one delta via onDelta.
 */
export async function chatStream(
  req: { messages: Msg[]; selected: string; temperature?: number },
  onDelta: (
    text: string,
    done: boolean,
    meta?: Omit<ChatResponse, "content">
  ) => void,
  opts?: { signal?: AbortSignal }
) {
  const controller = new AbortController();
  const signal = opts?.signal ?? controller.signal;

  const { provider, model } = splitProviderModel(req.selected);

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      model,
      temperature: req.temperature ?? 0.7,
      messages: req.messages,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`Chat stream failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as ChatResponse;
  // Emit one chunk (full content) and mark done
  onDelta(data.content || "", true, {
    provider: data.provider,
    model: data.model,
    usage: data.usage ?? undefined,
    latency_ms: data.latency_ms,
  });
}

/* ---------- helpers ---------- */

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
