import os
from typing import Iterable, List, Optional
import google.generativeai as genai
from ..schemas import Message
from .base import LLMProvider

class GeminiProvider(LLMProvider):
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.default_model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    def _to_gemini_history(self, messages: List[Message]):
        # map roles to Gemini expected format
        hist = []
        for m in messages:
            role = "user" if m.role == "user" else "model" if m.role == "assistant" else "user"
            hist.append({"role": role, "parts": [m.content]})
        return hist

    def complete(self, messages: List[Message], model: Optional[str] = None,
                 temperature: float = 0.3, top_p: float = 1.0) -> str:
        mdl = model or self.default_model
        g = genai.GenerativeModel(mdl)
        chat = g.start_chat(history=self._to_gemini_history(messages[:-1]))
        resp = chat.send_message(messages[-1].content,
                                 generation_config={"temperature": temperature, "top_p": top_p})
        return resp.text or ""

    def stream(self, messages: List[Message], model: Optional[str] = None,
               temperature: float = 0.3, top_p: float = 1.0) -> Iterable[str]:
        mdl = model or self.default_model
        g = genai.GenerativeModel(mdl)
        chat = g.start_chat(history=self._to_gemini_history(messages[:-1]))
        for chunk in chat.send_message_stream(
            messages[-1].content,
            generation_config={"temperature": temperature, "top_p": top_p}
        ):
            if chunk.text:
                yield chunk.text