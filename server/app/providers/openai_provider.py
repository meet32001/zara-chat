import os
from typing import Iterable, List, Optional
from openai import OpenAI
from ..schemas import Message
from .base import LLMProvider

class OpenAIProvider(LLMProvider):
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.default_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    def _to_openai_msgs(self, messages: List[Message]):
        return [{"role": m.role, "content": m.content} for m in messages]

    def complete(self, messages: List[Message], model: Optional[str] = None,
                 temperature: float = 0.3, top_p: float = 1.0) -> str:
        mdl = model or self.default_model
        r = self.client.chat.completions.create(
            model=mdl,
            messages=self._to_openai_msgs(messages),
            temperature=temperature,
            top_p=top_p,
        )
        return r.choices[0].message.content or ""

    def stream(self, messages: List[Message], model: Optional[str] = None,
               temperature: float = 0.3, top_p: float = 1.0) -> Iterable[str]:
        mdl = model or self.default_model
        with self.client.chat.completions.stream(
            model=mdl,
            messages=self._to_openai_msgs(messages),
            temperature=temperature,
            top_p=top_p,
        ) as s:
            for event in s:
                if event.type == "chunk":
                    for choice in event.data.choices:
                        if choice.delta and choice.delta.content:
                            yield choice.delta.content