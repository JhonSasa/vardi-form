# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY .env.local ./

# Copiar package.json y lockfiles primero
COPY package*.json ./

# Instalar dependencias
RUN npm install


# Copiar el resto del código fuente
COPY . .

# Construir la app Next.js
RUN npm run vardi-build

# Etapa 2: Producción
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar los artefactos de producción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "vardi-start"]
