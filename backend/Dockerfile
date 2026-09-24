FROM node:20-bookworm

WORKDIR /app

# Copy package files and registry config
COPY package*.json .npmrc ./

RUN npm install

# Copy all files including prisma and src
COPY . .

# VERY IMPORTANT: regenerate Prisma Business with final schema
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "run", "start:dev"]
