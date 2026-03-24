FROM node:20-slim

# Prisma needs OpenSSL
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy Prisma schema so we can generate the client at build time
COPY backend/prisma ./backend/prisma
RUN npx prisma generate --schema=backend/prisma/schema.prisma

COPY . .
RUN next build

EXPOSE 3000

CMD ["sh", "-c", "node backend/server.js & node_modules/.bin/next start -p ${PORT:-3000}"]
