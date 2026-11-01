"""Эндпоинт приёма заявки с формы: /api/requests (multipart).

Контракт: name, company, phone, email, direction, message, file?
  2xx -> { ok: true }
  4xx -> { message }   (сообщение показывается в интерфейсе)

Заявки сохраняются в SQLite (DATA_DIR/requests.db), вложение — в uploads/.
Поля объявлены необязательными в сигнатуре, чтобы любые ошибки возвращались
в едином формате { message }, а не как FastAPI 422 { detail }.
"""

from __future__ import annotations

import logging
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

from .. import config

logger = logging.getLogger("snabprom.requests")

router = APIRouter()

# Тот же набор, что на фронтенде (src/lib/validation.ts)
PHONE_RE = re.compile(r"^(\+?7|8)?\s*\(?\d{3}\)?\s*\d{3}[\s-]?\d{2}[\s-]?\d{2}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "webp"}


def _error(message: str, status: int = 400) -> JSONResponse:
    return JSONResponse(status_code=status, content={"message": message})


def _extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _validate(
    name: str,
    company: str,
    phone: str,
    email: str,
    direction: str,
    message: str,
) -> str | None:
    if len(name.strip()) < 2:
        return "Укажите имя (минимум 2 символа)."
    if len(company.strip()) > 120:
        return "Слишком длинное название компании."
    if not PHONE_RE.match(phone.strip()):
        return "Укажите телефон в формате +7 700 000 00 00."
    if not EMAIL_RE.match(email.strip()):
        return "Укажите корректный email."
    if not direction.strip():
        return "Выберите направление оборудования."
    if len(message.strip()) < 10:
        return "Опишите задачу подробнее (минимум 10 символов)."
    return None


def _save_request(record: dict, file_bytes: bytes | None, filename: str | None) -> None:
    """Сохраняет заявку в SQLite и вложение на диск (блокирующая работа)."""
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    db_path = config.DATA_DIR / "requests.db"

    file_path = None
    if file_bytes is not None and filename:
        uploads = config.DATA_DIR / "uploads"
        uploads.mkdir(parents=True, exist_ok=True)
        safe = re.sub(r"[^\w.\-]+", "_", filename)[:100]
        file_path = str(uploads / f"{uuid.uuid4().hex[:12]}_{safe}")
        Path(file_path).write_bytes(file_bytes)

    conn = sqlite3.connect(db_path, timeout=10)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS requests (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                name TEXT NOT NULL,
                company TEXT,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                direction TEXT NOT NULL,
                message TEXT NOT NULL,
                file_path TEXT,
                file_name TEXT
            )
            """
        )
        conn.execute(
            """
            INSERT INTO requests
                (id, created_at, name, company, phone, email, direction, message, file_path, file_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                uuid.uuid4().hex,
                datetime.now(timezone.utc).isoformat(timespec="seconds"),
                record["name"],
                record["company"],
                record["phone"],
                record["email"],
                record["direction"],
                record["message"],
                file_path,
                filename,
            ),
        )
        conn.commit()
    finally:
        conn.close()


@router.post("/api/requests")
async def create_request(
    name: Annotated[str, Form()] = "",
    company: Annotated[str, Form()] = "",
    phone: Annotated[str, Form()] = "",
    email: Annotated[str, Form()] = "",
    direction: Annotated[str, Form()] = "",
    message: Annotated[str, Form()] = "",
    file: Annotated[UploadFile | None, File()] = None,
):
    error = _validate(name, company, phone, email, direction, message)
    if error:
        return _error(error)

    file_bytes: bytes | None = None
    filename: str | None = None
    if file is not None and file.filename:
        filename = file.filename.strip()[:255]
        ext = _extension(filename)
        if ext not in ALLOWED_EXTENSIONS:
            return _error(
                "Допустимы файлы: PDF, DOC, DOCX, XLS, XLSX, изображения "
                "(JPG, PNG, WEBP)."
            )
        file_bytes = await file.read()
        if len(file_bytes) > config.MAX_FILE_SIZE:
            return _error(
                "Файл больше 10 МБ — сократите объём или пришлите его на "
                "info@snabpromtechmontazh.kz"
            )

    record = {
        "name": name.strip(),
        "company": company.strip(),
        "phone": phone.strip(),
        "email": email.strip(),
        "direction": direction.strip(),
        "message": message.strip(),
    }
    try:
        await run_in_threadpool(_save_request, record, file_bytes, filename)
    except Exception:
        logger.exception("Failed to save request")
        return _error(
            "Не удалось сохранить заявку — попробуйте позже или свяжитесь "
            "с нами по телефону +7 707 508 08 98.",
            status=500,
        )

    logger.info(
        "Request saved: %s <%s> (%s)",
        record["name"],
        record["email"],
        record["direction"],
    )
    return {"ok": True}
