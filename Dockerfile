# ============================================
# СнабПромТехМонтаж — лендинг
# Multi-stage: сборка Vite -> раздача nginx
# ============================================

# --- Этап 1: зависимости и сборка ---
FROM node:24-alpine AS build

WORKDIR /app

# Сначала манифесты — слой кеша npm не падает при правке исходников
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# --- Этап 2: продакшн-раздача ---
FROM nginx:1.27-alpine AS runtime

# Логи nginx в stdout/stderr (12-factor)
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
