"""Извлечение текста из XLSX (openpyxl) и XLS (xlrd).

Листы рендерятся в markdown-таблицы: пустые строки пропускаются,
пустые хвостовые колонки отрезаются.
"""

from __future__ import annotations

from io import BytesIO


def _rows_to_markdown(title: str, rows: list[list[str]]) -> str:
    rows = [r for r in rows if any(c for c in r)]
    if not rows:
        return ""
    width = max(len(r) for r in rows)
    while width > 0 and not any((r[width - 1] if len(r) >= width else "") for r in rows):
        width -= 1
    if width == 0:
        return ""
    rows = [(r + [""] * width)[:width] for r in rows]
    lines = [
        f"### Лист: {title}",
        "",
        "| " + " | ".join(rows[0]) + " |",
        "| " + " | ".join(["---"] * width) + " |",
    ]
    lines += ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join(lines)


def _render_sheet(ws, stringify) -> str:
    rows: list[list[str]] = []
    for row in ws.iter_rows(values_only=True):
        rows.append([stringify(v) for v in row])
    return _rows_to_markdown(ws.title, rows)


def extract_xlsx(data: bytes) -> str:
    import openpyxl

    def stringify(v) -> str:
        return "" if v is None else str(v).strip()

    # data_only=True отдаёт кэшированные значения формул; если кэша нет — фолбэк на raw
    wb = openpyxl.load_workbook(BytesIO(data), read_only=True, data_only=True)
    try:
        parts = [_render_sheet(ws, stringify) for ws in wb.worksheets]
    finally:
        wb.close()
    text = "\n\n".join(p for p in parts if p)
    if text:
        return text

    wb = openpyxl.load_workbook(BytesIO(data), read_only=True, data_only=False)
    try:
        parts = [_render_sheet(ws, stringify) for ws in wb.worksheets]
    finally:
        wb.close()
    return "\n\n".join(p for p in parts if p)


def extract_xls(data: bytes) -> str:
    import xlrd

    book = xlrd.open_workbook(file_contents=data)
    parts: list[str] = []
    for sheet in book.sheets():
        rows = [
            [str(sheet.cell_value(rx, cx)).strip() for cx in range(sheet.ncols)]
            for rx in range(sheet.nrows)
        ]
        md = _rows_to_markdown(sheet.name, rows)
        if md:
            parts.append(md)
    return "\n\n".join(parts)
