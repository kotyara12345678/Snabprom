"""Smoke-тест бэкенда: чат (текст + документы) и заявка.

Запуск: backend/.venv/Scripts/python.exe backend/smoke_test.py
Результаты пишутся в backend/smoke_out.txt (UTF-8).
"""

from __future__ import annotations

import io
import json
import sqlite3
from pathlib import Path

import httpx

BASE = "http://127.0.0.1:8000"
OUT = Path(__file__).parent / "smoke_out.txt"
TMP = Path(__file__).parent / "smoke_files"
TMP.mkdir(exist_ok=True)

lines: list[str] = []


def log(title: str, value) -> None:
    text = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2)
    lines.append(f"\n=== {title} ===\n{text}")


def make_docx() -> bytes:
    from docx import Document

    doc = Document()
    doc.add_heading("Техническое задание", level=1)
    doc.add_paragraph("Насос гидравлический, аналог Parker PV016, давление 350 бар.")
    doc.add_paragraph("Количество: 2 шт. Срок поставки: 6 недель.")
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).text = "Параметр"
    table.cell(0, 1).text = "Значение"
    table.cell(1, 0).text = "Рабочая жидкость"
    table.cell(1, 1).text = "минеральное масло"
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def make_xlsx() -> bytes:
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = "Спецификация"
    ws.append(["Позиция", "Наименование", "Кол-во"])
    ws.append([1, "Лента конвейерная 800 мм", 120])
    ws.append([2, "Ролик верхний 89х310", 350])
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def make_pdf() -> bytes:
    import pymupdf

    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Hydraulic filter element HF6510, qty 12 pcs.")
    data = doc.tobytes()
    doc.close()
    return data


def main() -> None:
    with httpx.Client(base_url=BASE, timeout=150) as client:
        log("healthz", client.get("/healthz").json())

        # 1. Текст
        r = client.post(
            "/api/chat",
            data={
                "sessionId": "smoke-text",
                "content": "Здравствуйте! Нужен гидронасос, какие параметры уточнить?",
            },
        )
        log("chat text", {"status": r.status_code, "body": r.json()})

        # 2. DOCX
        r = client.post(
            "/api/chat",
            data={
                "sessionId": "smoke-docx",
                "content": "Разбери ТЗ, что нужно поставить и в каком количестве?",
            },
            files={"file": ("tz.docx", make_docx(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        )
        log("chat docx", {"status": r.status_code, "body": r.json()})

        # 3. XLSX
        r = client.post(
            "/api/chat",
            data={"sessionId": "smoke-xlsx", "content": "Сколько позиций в спецификации и какие?"},
            files={"file": ("spec.xlsx", make_xlsx(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        log("chat xlsx", {"status": r.status_code, "body": r.json()})

        # 4. PDF
        r = client.post(
            "/api/chat",
            data={"sessionId": "smoke-pdf", "content": "Что за элемент в файле?"},
            files={"file": ("doc.pdf", make_pdf(), "application/pdf")},
        )
        log("chat pdf", {"status": r.status_code, "body": r.json()})

        # 5. Неподдерживаемый формат
        r = client.post(
            "/api/chat",
            data={"sessionId": "smoke-bad", "content": "прочитай"},
            files={"file": ("virus.exe", b"MZ...", "application/octet-stream")},
        )
        log("chat unsupported", {"status": r.status_code, "body": r.json()})

        # 6. Завершение сессии
        r = client.post("/api/chat/session", json={"sessionId": "smoke-text"})
        log("session end", {"status": r.status_code, "body": r.json()})

        # 7. Заявка с файлом
        r = client.post(
            "/api/requests",
            data={
                "name": "Иван",
                "company": "ТОО Тест",
                "phone": "+7 707 508 08 98",
                "email": "ivan@example.kz",
                "direction": "hydraulics",
                "message": "Нужен гидронасос, аналог Parker, 2 шт.",
            },
            files={"file": ("spec.xlsx", make_xlsx(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        )
        log("request ok", {"status": r.status_code, "body": r.json()})

        # 8. Невалидная заявка
        r = client.post(
            "/api/requests",
            data={
                "name": "И",
                "phone": "123",
                "email": "bad",
                "direction": "",
                "message": "кратко",
            },
        )
        log("request invalid", {"status": r.status_code, "body": r.json()})

    db = Path(__file__).parent / "data" / "requests.db"
    if db.exists():
        conn = sqlite3.connect(db)
        rows = conn.execute(
            "SELECT name, company, phone, email, direction, message, file_name FROM requests"
        ).fetchall()
        conn.close()
        log("sqlite rows", rows)
    else:
        log("sqlite", "ФАЙЛ НЕ СОЗДАН")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print("OK:", OUT)


if __name__ == "__main__":
    main()
