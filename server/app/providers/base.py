from abc import ABC, abstractmethod
from typing import Iterable, List, Optional
from ..schemas import Message

class LLMProvider(ABC):
    @abstractmethod
    def complete(self,
                 messages: List[Message],
                 model: Optional[str] = None,
                 temperature: float = 0.3,
                 top_p: float = 1.0) -> str:
        ...

    @abstractmethod
    def stream(self,
               messages: List[Message],
               model: Optional[str] = None,
               temperature: float = 0.3,
               top_p: float = 1.0) -> Iterable[str]:
        ...