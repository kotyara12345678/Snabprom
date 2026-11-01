"""Конфигурация бэкенда: переменные окружения и промпт консультанта."""

from __future__ import annotations

import os
from pathlib import Path

# backend/ (родитель app/)
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = Path(os.environ.get("DATA_DIR", BASE_DIR / "data"))

# --- AI (OpenAI-совместимый API, polza.ai) ---
AI_API_KEY = os.environ.get("AI_API_KEY", "")
AI_BASE_URL = os.environ.get("AI_BASE_URL", "https://polza.ai/api/v1").rstrip("/")
AI_MODEL = os.environ.get("AI_MODEL", "openai/gpt-6-luna")
AI_TIMEOUT_SECONDS = float(os.environ.get("AI_TIMEOUT_SECONDS", "120"))

# --- Лимиты ---
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ (совпадает с валидацией на фронтенде)
MAX_CONTENT_LENGTH = 10_000       # символов текста сообщения
MAX_HISTORY_TURNS = 24            # ходов диалога, передаваемых модели
SESSION_TTL_SECONDS = 30 * 60     # живучесть диалога в памяти
EXTRACTED_TEXT_LIMIT = 60_000     # символов текста из одного документа

# --- CORS (dev-режим Vite; в Docker запросы идут same-origin через nginx) ---
CORS_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if o.strip()
]

# --- Промпты: единственный источник — .md-файл рядом с этим модулем ---
_PROMPTS_DIR = Path(__file__).resolve().parent / "prompts"


def load_prompt(name: str) -> str:
    """Читает промпт из .md-файла (UTF-8) и убирает крайние пробелы."""
    return (_PROMPTS_DIR / name).read_text(encoding="utf-8").strip()


SYSTEM_PROMPT = load_prompt("system-prompt.md")
