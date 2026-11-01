"""FastAPI-приложение бэкенда ТОО «СнабПромТехМонтаж».

Эндпоинты:
  POST /api/chat          — AI-консультант (multipart, вложения)
  POST /api/chat/session  — завершение диалога
  POST /api/requests      — приём заявки с формы
  GET  /healthz           — healthcheck
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .routers import chat, requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = FastAPI(
    title="СнабПромТехМонтаж API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url=None,
)

# CORS: dev-режим Vite на 5173; в Docker запросы идут same-origin через nginx
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(requests.router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
