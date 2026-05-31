FROM node:20.12.0

WORKDIR /usr/src/app

# העתקת קבצי ההגדרות
COPY package*.json ./

# התקנה נקייה
RUN npm install

# העתקת כל הקוד
COPY . .

# בניית ה-TypeScript
RUN npm run build
CMD ["npm", "start"]