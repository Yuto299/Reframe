FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

ENV NODE_ENV=development
RUN npm install

CMD ["npm", "run", "dev"]