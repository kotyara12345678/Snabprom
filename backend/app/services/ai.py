"""Клиент AI-провайдера (OpenAI-совместимый /chat/completions, polza.ai)."""

from __future__ import annotations

import logging

import httpx

from .. import config

logger = logging.getLogger("snabprom.ai")


class AiUnavailableError(RuntimeError):
    """Сервис AI недоступен или вернул ошибку (сообщение показывается пользователю)."""


async def chat_completion(messages: list[dict]) -> str:
    """Отправляет messages в модель и возвращает текст ответа.

    Ключ API уходит только в заголовке запроса на стороне сервера.
    """
    if not config.AI_API_KEY:
        raise AiUnavailableError(
            "Консультант не настроен: не задан ключ AI_API_KEY."
        )

    url = f"{config.AI_BASE_URL}/chat/completions"
    payload = {"model": config.AI_MODEL, "messages": messages}

    try:
        async with httpx.AsyncClient(timeout=config.AI_TIMEOUT_SECONDS) as client:
            response = await client.post(
                url,
                json=payload,
                headers={"Authorization": f"Bearer {config.AI_API_KEY}"},
            )
    except httpx.TimeoutException:
        logger.warning("AI request timed out after %ss", config.AI_TIMEOUT_SECONDS)
        raise AiUnavailableError(
            "Модель не ответила за отведённое время. Попробуйте ещё раз."
        ) from None
    except httpx.HTTPError as exc:
        logger.warning("AI request failed: %s", type(exc).__name__)
        raise AiUnavailableError(
            "Не удалось связаться с сервисом консультанта. Попробуйте позже."
        ) from None

    if response.status_code in (401, 403):
        logger.error("AI auth error: HTTP %s", response.status_code)
        raise AiUnavailableError(
            "Консультант не авторизован на сервере. Попробуйте позже или оставьте заявку."
        )
    if response.status_code != 200:
        logger.error("AI HTTP %s: %s", response.status_code, response.text[:500])
        raise AiUnavailableError(
            "Сервис консультанта временно недоступен. Оставьте заявку — мы ответим лично."
        )

    try:
        data = response.json()
        content = data["choices"][0]["message"]["content"]
    except (ValueError, KeyError, IndexError, TypeError) as exc:
        logger.error("AI unexpected response: %s", response.text[:500])
        raise AiUnavailableError(
            "Сервис консультанта вернул неожиданный ответ. Попробуйте позже."
        ) from exc

    # Некоторые провайдеры возвращают content списком частей
    if isinstance(content, list):
        content = "".join(
            part.get("text", "") for part in content if isinstance(part, dict)
        )
    if not isinstance(content, str) or not content.strip():
        logger.error("AI empty content: %s", response.text[:500])
        raise AiUnavailableError(
            "Консультант вернул пустой ответ. Попробуйте ещё раз."
        )
    return content.strip()
