# ТОО «СнабПромТехМонтаж» — корпоративный лендинг

Лендинг компании по поставкам промышленного оборудования из Китая.
Стек: **React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Lucide**.

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
└── modules/ai-chat/               # AI-консультант
    ├── types.ts                   # Контракт сообщений/запросов/ответов, приветствие, быстрые варианты
    ├── api/chatApi.ts             # Клиент backend-эндпоинта (MultipartFile -> JSON-ответ); без фейковых ответов
    ├── useChat.ts                 # Состояние диалога: отправка, ожидание, ошибка+retry, завершение/рестарт
    └── components/                # AIChatWidget (кнопка+окно), MessageList, ChatInput
```

## Запуск

```bash
# Разработка
npm install
npm run dev            # http://localhost:5173

# Продакшн-сборка
npm run build          # dist/
npm run preview

# Docker (рекомендуемый способ)
docker compose up --build
# => http://localhost:8080
```

Контейнер раздаёт статику через nginx, отдаёт `/healthz` для healthcheck и
фолбэчит SPA-роутинг на `index.html`.

## Конфигурация backend-эндпоинтов

Frontend принципиально **не имитирует** отправку заявок и ответы AI. Эндпоинты
настраиваются через переменные окружения (Vite):

| Переменная              | По умолчанию   | Назначение                                  |
| ----------------------- | -------------- | ------------------------------------------- |
| `VITE_REQUESTS_API_URL` | `/api/requests`| Приём заявки (multipart/form-data)          |
| `VITE_AI_CHAT_URL`      | `/api/chat`    | Ответы AI-консультанта (multipart -> JSON)  |

### Контракт формы заявки

```
POST {VITE_REQUESTS_API_URL}   Content-Type: multipart/form-data
поля: name, company, phone, email, direction, message, file? (PDF/DOCX/XLSX/изображения, ≤10 МБ)
2xx        -> ok
4xx/5xx    -> { message?: string }  -> показывается в интерфейсе
Нет ответа -> честное сообщение «Сервер приёма заявок недоступен» + контакты
```

### Контракт AI-чата

```
POST {VITE_AI_CHAT_URL}          multipart: sessionId, content, file?
  200 -> { sessionId, reply: { content: string } }     # единственный источник текста ассистента

POST {VITE_AI_CHAT_URL}/session  JSON: { sessionId }
  200 -> { ok: true }            # завершение диалога, очистка контекста на сервере
```

Клиент генерирует `sessionId` (sessionStorage), показывает индикатор набора,
поддерживает повтор при ошибке и вложения ≤10 МБ. Готовых «ответов AI» на
клиенте нет — до подключения backend виджет показывает честное состояние ошибки.

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
