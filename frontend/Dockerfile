# ==================================
# Base stage - 共通の基盤イメージ
# ==================================
FROM node:22-alpine AS base
WORKDIR /app

# ==================================
# Dependencies stage - 依存関係インストール（共通）
# ==================================
FROM base AS deps

COPY package*.json ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

RUN npm ci

# ==================================
# Builder stage - 静的エクスポート用ビルド
# ==================================
FROM deps AS builder

COPY shared ./shared
COPY frontend ./frontend

WORKDIR /app/frontend

# Next.js static export
RUN npm run build && npm run export

# ==================================
# Production stage - Nginx 配信
# ==================================
FROM nginx:alpine AS production

# Nginx default config を置き換える場合はここで COPY
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Next.js export 出力を Nginx の公開ディレクトリへ
COPY --from=builder /app/frontend/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]