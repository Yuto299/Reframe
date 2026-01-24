# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install dependencies
RUN npm ci

# Copy source files
COPY shared ./shared
COPY backend ./backend

# Build backend
WORKDIR /app/backend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm ci --omit=dev --workspace=shared --workspace=backend

# Copy built files
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/index.js"]
