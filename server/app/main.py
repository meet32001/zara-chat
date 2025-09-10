# server/app/main.py
import os
import time
from typing import List, Literal, Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

from pathlib import Path
from dotenv import load_dotenv
load_dotenv()  # Load variables from .env into process env

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env") 

# Optional: google generative ai (only if Gemini is selected)
try:
    import google.generativeai as genai
except Exception:
    genai = None

# ---- Environment ----
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "gemini")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
GROQ_API_KEY     = os.getenv("GROQ_API_KEY", "")

CORS_ORIGINS = [
    o.strip() for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:8080"
    ).split(",") if o.strip()
]

REQUIRED_KEYS = {
    "gemini": GEMINI_API_KEY,
    "deepseek": DEEPSEEK_API_KEY,
    "groq": GROQ_API_KEY,
}

app = FastAPI(title="Zara Chat API", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Schemas ----
Provider = Literal["gemini", "deepseek", "groq"]

class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"] = "user"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(
        ..., description="Chat-style message list. Provide at least one user message."
    )
    provider: Optional[Provider] = Field(
        None, description="gemini | deepseek | groq. If omitted, uses MODEL_PROVIDER env."
    )
    model: Optional[str] = Field(
        None, description="Model id for the provider. If omitted, uses a sensible default."
    )
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = None  # not all providers use this

class ChatResponse(BaseModel):
    provider: Provider
    model: str
    content: str
    usage: Optional[Dict[str, Any]] = None
    latency_ms: int

# ---- Utilities ----
def extract_user_content(messages: List[ChatMessage]) -> str:
    """Merge messages into a single prompt for providers that prefer one string."""
    parts = []
    for m in messages:
        if m.role in ("system", "assistant", "user"):
            prefix = {"system": "[System]\n", "assistant": "Assistant:\n", "user": "User:\n"}[m.role]
            parts.append(f"{prefix}{m.content}")
    return "\n\n".join(parts)

def ensure_key(provider: str) -> None:
    key = REQUIRED_KEYS.get(provider)
    if not key:
        raise HTTPException(status_code=400, detail=f"Missing API key for provider: {provider}")

# ---- Provider Calls ----
async def call_deepseek(model: str, req: ChatRequest) -> ChatResponse:
    ensure_key("deepseek")
    url = "https://api.deepseek.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": model or "deepseek-chat",
        "messages": [m.model_dump() for m in req.messages],
        "temperature": req.temperature,
        # DeepSeek supports max_tokens; include if provided
        **({"max_tokens": req.max_tokens} if req.max_tokens else {}),
    }
    t0 = time.time()
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=payload)
    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    data = r.json()
    content = data["choices"][0]["message"]["content"]
    usage = data.get("usage")
    return ChatResponse(
        provider="deepseek",
        model=payload["model"],
        content=content,
        usage=usage,
        latency_ms=int((time.time() - t0) * 1000),
    )

async def call_groq(model: str, req: ChatRequest) -> ChatResponse:
    ensure_key("groq")
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": model or "llama-3.1-8b-instant",
        "messages": [m.model_dump() for m in req.messages],
        "temperature": req.temperature,
        **({"max_tokens": req.max_tokens} if req.max_tokens else {}),
    }
    t0 = time.time()
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, headers=headers, json=payload)
    if r.status_code >= 400:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    data = r.json()
    content = data["choices"][0]["message"]["content"]
    usage = data.get("usage")
    return ChatResponse(
        provider="groq",
        model=payload["model"],
        content=content,
        usage=usage,
        latency_ms=int((time.time() - t0) * 1000),
    )

async def call_gemini(model: str, req: ChatRequest) -> ChatResponse:
    ensure_key("gemini")
    if genai is None:
        raise HTTPException(status_code=500, detail="google-generativeai not installed")
    genai.configure(api_key=GEMINI_API_KEY)

    model_id = model or GEMINI_MODEL or "gemini-1.5-flash"
    prompt = extract_user_content(req.messages)
    t0 = time.time()
    gmodel = genai.GenerativeModel(model_id)
    result = gmodel.generate_content(
        prompt,
        generation_config={"temperature": req.temperature}
    )
    if getattr(result, "prompt_feedback", None) and getattr(result.prompt_feedback, "block_reason", None):
        raise HTTPException(status_code=400, detail=f"Gemini blocked: {result.prompt_feedback.block_reason}")
    content = "".join([p.text for p in result.candidates[0].content.parts]) if result.candidates else ""
    return ChatResponse(
        provider="gemini",
        model=model_id,
        content=content,
        usage=None,
        latency_ms=int((time.time() - t0) * 1000),
    )

# ---- Routing ----
@app.get("/health")
async def health():
    return {"ok": True, "provider_default": MODEL_PROVIDER}

@app.get("/models")
async def models():
    return {
        "gemini": ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
        "deepseek": ["deepseek-chat", "deepseek-coder"],
        "groq": ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"],
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    provider = (req.provider or MODEL_PROVIDER).lower().strip()
    model = (req.model or "").strip()
    print(f"[Zara API] /api/chat -> provider={provider} model={model}")
    print("[Zara API] payload=", req.model_dump())

    if not req.messages or all(m.content.strip() == "" for m in req.messages):
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    if provider not in ("gemini", "deepseek", "groq"):
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    # Early key validation for selected provider
    ensure_key(provider)

    if provider == "deepseek":
        return await call_deepseek(model, req)
    elif provider == "groq":
        return await call_groq(model, req)
    else:  # gemini
        return await call_gemini(model, req)