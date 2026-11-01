"""Эндпоинты AI-чата: /api/chat и /api/chat/session.

Контракт (мультипарт -> JSON):
  POST /api/chat         sessionId, content, file? -> { sessionId, reply: { content } }
  POST /api/chat/session JSON { sessionId }         -> { ok: true }
"""

from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse

from .. import config
from ..services.ai import AiUnavailableError, chat_completion
from ..services.extraction import UnsupportedFileError, extract_document
from ..services.sessions import sessions

logger = logging.getLogger("snabprom.chat")

router = APIRouter()


def _error(status: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status, content={"message": message})


def _build_user_content(
    text: str, filename: str | None, doc_text: str, image_url: str | None
) -> str | list:
    """Собирает content сообщения пользователя: текст + документ или изображение."""
    if image_url:
        header = text or "Разбери это изображение."
        return [
            {"type": "text", "text": header},
            {"type": "image_url", "image_url": {"url": image_url}},
        ]
    if doc_text:
        return (
            f"{text}\n\n"
            f"--- Содержимое файла «{filename}» ---\n"
            f"{doc_text}\n"
            f"--- Конец содержимого файла ---"
        )
    return text


@router.post("/api/chat")
async def chat(
    sessionId: Annotated[str, Form()],
    content: Annotated[str, Form()] = "",
    file: Annotated[UploadFile | None, File()] = None,
):
    session_id = (sessionId or "").strip()[:128]
    if not session_id:
        return _error(400, "Не передан идентификатор сессии.")

    text = (content or "").strip()
    if len(text) > config.MAX_CONTENT_LENGTH:
        return _error(400, "Сообщение слишком длинное — сократите текст.")

    filename: str | None = None
    doc_text = ""
    image_url: str | None = None

    if file is not None and file.filename:
        data = await file.read()
        if len(data) > config.MAX_FILE_SIZE:
            return _error(
                400,
                "Файл больше 10 МБ — сократите объём или пришлите его на "
                "info@snabpromtechmontazh.kz",
            )
        filename = file.filename.strip()[:255]
        try:
            extracted = await run_in_threadpool(
                extract_document, filename, data, config.EXTRACTED_TEXT_LIMIT
            )
        except UnsupportedFileError as exc:
            return _error(400, str(exc))
        except Exception:
            logger.exception("Extraction failed for %s", filename)
            return _error(
                400,
                "Не удалось прочитать файл — он повреждён или в неподдерживаемом "
                "формате. Пришлите PDF/DOCX или опишите задачу словами.",
            )
        if extracted.kind == "image":
            image_url = extracted.image_data_url
        else:
            doc_text = extracted.text

    if not text and not image_url and not doc_text:
        return _error(400, "Сообщение пустое — напишите текст или прикрепите файл.")

    # --- История диалога (последние ходы) + новый ход ---
    history = sessions.history(session_id)
    user_content = _build_user_content(text, filename, doc_text, image_url)
    messages = [{"role": "system", "content": config.SYSTEM_PROMPT}]
    messages += history
    messages.append({"role": "user", "content": user_content})

    try:
        reply = await chat_completion(messages)
    except AiUnavailableError as exc:
        return _error(503, str(exc))

    # В историю сохраняем текстовую форму (изображения — только подпись)
    stored_user = text
    if image_url:
        stored_user = (text + " [изображение]").strip()
    elif doc_text:
        stored_user = f"{text} [файл: {filename}, содержимое передано модели]".strip()
    sessions.append(session_id, {"role": "user", "content": stored_user})
    sessions.append(session_id, {"role": "assistant", "content": reply})

    return {"sessionId": session_id, "reply": {"content": reply}}


@router.post("/api/chat/session")
async def end_session(payload: dict):
    session_id = str(payload.get("sessionId", "")).strip()[:128]
    if session_id:
        sessions.clear(session_id)
    return {"ok": True}
