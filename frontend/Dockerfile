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
COPY frontend/package.json ./frontend/

RUN npm ci

# ==================================
# Development stage - 開発環境
# ==================================
FROM deps AS development

COPY frontend ./frontend

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

# ==================================
# Builder stage - 本番ビルド用
# ==================================
FROM deps AS builder

COPY frontend ./frontend

WORKDIR /app/frontend
RUN npm run build

# ==================================
# Production stage - 本番環境
# ==================================
FROM base AS production

COPY package*.json ./
COPY frontend/package.json ./frontend/

RUN npm ci --omit=dev --workspace=@reframe/frontend

COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["node", "frontend/server.js"]
