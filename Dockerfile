FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma.config.ts ./
COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
