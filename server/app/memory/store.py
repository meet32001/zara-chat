# Simple in-memory conversation store.
# Swap later for Redis/SQLite without changing controllers.
from collections import defaultdict
from typing import List
from ..schemas import Message

class MemoryStore:
    def __init__(self):
        self._convos = defaultdict(list)  # session_id -> [Message]

    def append(self, session_id: str, messages: List[Message]):
        self._convos[session_id].extend(messages)

    def history(self, session_id: str) -> List[Message]:
        return self._convos[session_id]

    def truncate(self, session_id: str, max_tokens_hint: int = 6000):
        # placeholder: implement token-aware trimming later
        pass

store = MemoryStore()