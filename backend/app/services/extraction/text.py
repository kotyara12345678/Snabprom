"""Извлечение текста из TXT/CSV: UTF-8 с фолбэком на cp1251/latin-1."""

from __future__ import annotations


def extract_text(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "cp1251", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")
