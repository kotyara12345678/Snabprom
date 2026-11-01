"""Извлечение текста из PDF через PyMuPDF (pymupdf)."""

from __future__ import annotations


def extract_pdf(data: bytes) -> str:
    import pymupdf

    parts: list[str] = []
    with pymupdf.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            parts.append(page.get_text() or "")
    return "\n\n".join(parts)
