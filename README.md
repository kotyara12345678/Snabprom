# ТОО «СнабПромТехМонтаж» — корпоративный лендинг

Лендинг компании по поставкам промышленного оборудования из Китая.
Стек: **React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Lucide**,
бэкенд: **Python 3.13 + FastAPI + uvicorn**.

## Структура

```
src/
├── config/site.ts                 # Все данные компании: контакты, навигация, 6 направлений, услуги, этапы, инкотермсы
├── components/
│   ├── layout/                    # Header (фикс., мобильное меню), Footer
│   ├── sections/                  # Hero, About, Directions, Services, Process, Logistics, Advantages, RequestSection, Contacts
│   └── ui/                        # Button, Section/SectionHeading, Reveal (анимации), SmartImage (fallback), Field (инпуты с ошибками)
├── lib/
│   ├── validation.ts              # Валидация формы: имя, телефон, email, направление, описание, файл (тип/размер)
│   └── api/requestsApi.ts         # Клиент отправки заявки (multipart) + честные состояния ошибки
└── modules/ai-chat/               # AI-консультант (frontend)
    ├── types.ts                   # Контракт сообщений/запросов/ответов, приветствие, быстрые варианты
    ├── api/chatApi.ts             # Клиент backend-эндпоинта (MultipartFile -> JSON-ответ); без фейковых ответов
    ├── useChat.ts                 # Состояние диалога: отправка, ожидание, ошибка+retry, завершение/рестарт
    ├── prompts/                   # greeting.md, quick-replies.md (подключаются через Vite ?raw)
    └── components/                # AIChatWidget (кнопка+окно), MessageList, ChatInput

backend/
├── app/
│   ├── main.py                    # FastAPI-приложение, CORS, /healthz
│   ├── config.py                  # Переменные окружения + загрузка системного промпта
│   ├── prompts/system-prompt.md   # Системный промпт консультанта (.md)
│   ├── routers/
│   │   ├── chat.py                # POST /api/chat, POST /api/chat/session
│   │   └── requests.py            # POST /api/requests (SQLite + uploads/)
│   └── services/
│       ├── ai.py                  # Клиент polza.ai (OpenAI-совместимый /chat/completions)
│       ├── sessions.py            # История диалогов в памяти (по sessionId, TTL 30 мин)
│       └── extraction/            # Разбор вложений: PDF (PyMuPDF), DOCX (python-docx),
│                                  #   XLSX/XLS (openpyxl/xlrd), TXT, изображения -> data:URL
├── Dockerfile                     # python:3.13-slim + uvicorn (не.root)
└── requirements.txt
```

## Запуск

```bash
# --- Frontend ---
npm install
npm run dev            # http://localhost:5173 (проксирует /api -> localhost:8000)
npm run build          # dist/

# --- Backend (локально) ---
python -m venv backend/.venv
backend/.venv/Scripts/pip install -r backend/requirements.txt   # Linux/macOS: backend/.venv/bin/pip
set -a && source .env && set +a                                 # ключ AI
uvicorn app.main:app --reload --port 8000                       # из каталога backend/

# --- Docker (рекомендуемый способ) ---
docker compose up --build
# => http://localhost:8080  (nginx проксирует /api/ на backend:8000)
```

Ключ AI (`AI_API_KEY`) живёт **только** в `.env` (не коммитится, не попадает
в образ frontend, не уходит в браузер).

## Конфигурация

См. `.env.example`:

| Переменная               | По умолчанию                    | Назначение                                |
| ------------------------ | ------------------------------- | ----------------------------------------- |
| `AI_API_KEY`             | — (обязательно)                 | Ключ polza.ai для backend                 |
| `AI_BASE_URL`            | `https://polza.ai/api/v1`       | Base URL OpenAI-совместимого API           |
| `AI_MODEL`               | `openai/gpt-6-luna`             | Модель                                    |
| `AI_TIMEOUT_SECONDS`     | `110`                           | Таймаут вызова модели                     |
| `VITE_REQUESTS_API_URL`  | `/api/requests`                 | Приём заявки (multipart/form-data)        |
| `VITE_AI_CHAT_URL`       | `/api/chat`                     | Ответы AI-консультанта (multipart -> JSON) |

### Контракт формы заявки

```
POST {VITE_REQUESTS_API_URL}   Content-Type: multipart/form-data
поля: name, company, phone, email, direction, message, file? (PDF/DOC/DOCX/XLS/XLSX/изображения, ≤10 МБ)
2xx        -> { ok: true }      (сохраняется в SQLite + файл в uploads/)
4xx/5xx    -> { message }       -> показывается в интерфейсе
Нет ответа -> честное сообщение «Сервер приёма заявок недоступен» + контакты
```

### Контракт AI-чата

```
POST {VITE_AI_CHAT_URL}          multipart: sessionId, content, file?
  200 -> { sessionId, reply: { content: string } }   # единственный источник текста ассистента
  4xx/5xx -> { message }         # честная причина (файл не прочитан, модель недоступна…)

POST {VITE_AI_CHAT_URL}/session  JSON: { sessionId }
  200 -> { ok: true }            # завершение диалога, очистка истории на сервере
```

Backend разбирает вложения **до** отправки модели: PDF/DOCX/XLSX/XLS/TXT → текст,
изображения → `data:URL` (vision). История диалога хранится по `sessionId`
в памяти процесса (TTL 30 минут). Ключ модели и системный промпт
(`backend/app/prompts/system-prompt.md`) — только на сервере.
Готовых «ответов AI» на клиенте нет: при ошибке показывается честное сообщение.

## CI/CD

`.github/workflows/ci.yml` — два прогона на каждый push/PR в main:

1. **Lint & Build** — `npm ci`, `npm run lint`, `npm run build`, артефакт `dist`.
2. **Docker build & scan** — сборка образа с GHA-кешем и smoke-тест контейнера
   (проверка `/healthz` и отдачи HTML).

Следующий job — **заглушка деплоя** (`deploy-placeholder`): подключите свой
реестр/сервер (docker push + compose up) после выбора хостинга.

## Дизайн

Premium Industrial Corporate: графит/чёрный, оранжево-медный акцент, стальной
серый, светлые секции. Без градиентов-ради-градиентов, неона и выдуманной
статистики. Анимации уважают `prefers-reduced-motion`.

## SEO

`title`/`description`/OG-теги, `favicon.svg`, `robots.txt`, `sitemap.xml`,
JSON-LD Organization, семантическая разметка H1–H3, lazy loading изображений.
