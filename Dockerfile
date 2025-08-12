# ---------- Etapa 1: deps (cachea node_modules) ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Para libs nativas comunes (sharp, etc). Si no usas, puedes omitir.
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci --no-audit --no-fund

# ---------- Etapa 2: build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Vars de build para exponer al frontend
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}

# Copia node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules
# Copia el resto del código
COPY . .

# Desactiva telemetría y construye en modo standalone
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run vardi-build

# ---------- Etapa 3: runner mínimo ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copia solo lo que requiere el runtime standalone
# (esto incluye server.js y node_modules necesarios para el server)
COPY --from=builder /app/.next/standalone ./ 
# Recursos estáticos
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Usuario no root (opcional pero recomendado)
RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -s /bin/sh -D nextjs
USER nextjs

EXPOSE 3000
# En standalone, la entrada suele ser server.js en la raíz copiada
CMD ["node", "server.js"]
