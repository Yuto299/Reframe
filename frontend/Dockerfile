# ==================================
# Development stage only - 開発環境
# ==================================
FROM node:22-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "dev"]