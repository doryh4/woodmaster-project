FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# כאן אנחנו אומרים ל-Docker להשתמש ב-ts-node כדי להריץ את ה-index.ts
# זה הפתרון הכי פשוט כרגע כדי לא להסתבך עם הגדרות build
CMD ["npx", "ts-node", "index.ts"]