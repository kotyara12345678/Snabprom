"""Извлечение текста из вложений чата и файлов заявки.

Методология (адаптирована из AI-Document-Assistant):
  PDF  -> PyMuPDF (fitz)
  DOCX -> python-docx (абзацы + таблицы, разделитель — табуляция)
  XLSX -> openpyxl read-only (data_only=True, фолбэк на raw-значения)
  XLS  -> xlrd
  TXT  -> UTF-8 с фолбэком на cp1251/latin-1
  Изображения -> data:URL (передаётся модели как image_url)
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import PurePosixPath

from .docx import extract_docx
from .pdf import extract_pdf
from .spreadsheet import extract_xls, extract_xlsx
from .text import extract_text


class UnsupportedFileError(ValueError):
    """Файл в формате, который backend не умеет читать (сообщение для пользователя)."""


@dataclass
class ExtractedDocument:
    """Результат разбора вложения."""

    kind: str  # pdf | docx | xls | xlsx | txt | image
    text: str = ""  # извлечённый текст (пусто для изображений)
    image_data_url: str | None = None  # data:URL для изображений
    truncated: bool = False


_IMAGE_MIME = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}


def extension_of(filename: str) -> str:
    """Расширение файла в нижнем регистре без точки."""
    return PurePosixPath(filename.replace("\\", "/")).suffix.lstrip(".").lower()


def extract_document(filename: str, data: bytes, max_chars: int) -> ExtractedDocument:
    """Разбирает вложение, возвращает текст или data:URL изображения.

    Бросает UnsupportedFileError с человекочитаемым сообщением для неподдерживаемых
    форматов и пустые/битые файлы.
    """
    ext = extension_of(filename)
    if not data:
        raise UnsupportedFileError("Файл пустой — пришлите его повторно.")

    if ext in _IMAGE_MIME:
        import base64

        b64 = base64.b64encode(data).decode("ascii")
        return ExtractedDocument(
            kind="image",
            image_data_url=f"data:{_IMAGE_MIME[ext]};base64,{b64}",
        )

    if ext == "pdf":
        text = extract_pdf(data)
    elif ext == "docx":
        text = extract_docx(data)
    elif ext == "xlsx":
        text = extract_xlsx(data)
    elif ext == "xls":
        text = extract_xls(data)
    elif ext in ("txt", "csv"):
        text = extract_text(data)
    else:
        raise UnsupportedFileError(
            "Этот формат не поддерживается. Пришлите PDF, DOCX, XLSX, XLS, TXT "
            "или изображение (JPG, PNG, WEBP)."
        )

    text = text.strip()
    if not text:
        raise UnsupportedFileError(
            "Текст из файла не извлечён (возможно, это скан или защищённый документ). "
            "Пришлите файл в PDF/DOCX с текстом или опишите задачу словами."
        )

    if len(text) > max_chars:
        text = text[:max_chars] + "\n\n[…текст файла обрезан по лимиту…]"
        return ExtractedDocument(kind=ext, text=text, truncated=True)
    return ExtractedDocument(kind=ext, text=text)
