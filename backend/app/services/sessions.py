"""Хранилище диалогов в памяти: история по sessionId с TTL-очисткой."""

from __future__ import annotations

import threading
import time

from .. import config

Message = dict  # {"role": "user"|"assistant", "content": str}


class SessionStore:
    """Потокобезопасное хранилище сессий чата (один процесс uvicorn)."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._sessions: dict[str, tuple[float, list[Message]]] = {}

    def _cleanup_locked(self, now: float) -> None:
        expired = [
            sid
            for sid, (updated, _) in self._sessions.items()
            if now - updated > config.SESSION_TTL_SECONDS
        ]
        for sid in expired:
            del self._sessions[sid]

    def history(self, session_id: str) -> list[Message]:
        now = time.monotonic()
        with self._lock:
            self._cleanup_locked(now)
            entry = self._sessions.get(session_id)
            if not entry:
                return []
            updated, messages = entry
            self._sessions[session_id] = (now, messages)
            return list(messages)

    def append(self, session_id: str, message: Message) -> None:
        now = time.monotonic()
        with self._lock:
            self._cleanup_locked(now)
            _, messages = self._sessions.get(session_id, (now, []))
            messages.append(message)
            # Ограничиваем длину истории (последние N сообщений)
            limit = config.MAX_HISTORY_TURNS * 2
            if len(messages) > limit:
                messages = messages[-limit:]
            self._sessions[session_id] = (now, messages)

    def clear(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


# Единый экземпляр на процесс
sessions = SessionStore()
