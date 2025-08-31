# frontend/Dockerfile
FROM node:20-bullseye

WORKDIR /app

# Копіюємо тільки package.json та package-lock.json для кешування layer
COPY package*.json ./

RUN npm install

# Копіюємо весь код
COPY . .

# Dev server порт CRA
EXPOSE 3000

# Запуск React у dev режимі з live reload
CMD ["npm", "start"]