# ==================================
# Development stage - 開発環境
# ==================================
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "dev"]

# ==================================
# Builder stage - 本番ビルド用
# ==================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ==================================
# Production stage - 本番環境
# ==================================
FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/src/index.js"]
