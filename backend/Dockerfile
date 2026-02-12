FROM node:20-bookworm

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# install playwright browsers + system deps
RUN npx playwright install --with-deps

# Copy all files including prisma and src
COPY . .

# VERY IMPORTANT: regenerate Prisma Business with final schema
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "start:dev"]