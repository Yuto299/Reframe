# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.ts ./

# Install dependencies
RUN npm install

# Build frontend - Next.js static export
COPY src ./src
COPY public ./public
RUN npm run build

# Production stage - Nginx for static file serving
FROM nginx:alpine AS production

ENV NODE_ENV=production

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files from builder
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
