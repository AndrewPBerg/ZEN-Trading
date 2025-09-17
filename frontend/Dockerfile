# docker file for next.js TSX frontend
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 9669

CMD ["npm", "start"]
