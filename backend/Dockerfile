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
COPY backend/package.json ./backend/

RUN npm ci

# ==================================
# Development stage - 開発環境
# ==================================
FROM deps AS development

COPY backend ./backend

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=8080
EXPOSE 8080

# ==================================
# Builder stage - 本番ビルド用
# ==================================
FROM deps AS builder

COPY backend ./backend

WORKDIR /app/backend
RUN npm run build

# ==================================
# Production stage - 本番環境
# ==================================
FROM base AS production

COPY package*.json ./
COPY backend/package.json ./backend/

RUN npm ci --omit=dev --workspace=@reframe/backend

COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/backend/src/index.js"]
