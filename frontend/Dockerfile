# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Dependencies pehle install karo (cache efficient)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Source copy karo aur build karo
COPY . .
RUN npm run build

# ── Production stage (serve static files) ────────────────────────────────────
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Previous static content remove karo
RUN rm -rf ./*

# Next.js build output copy karo
COPY --from=builder /app/.next/static ./_next/static/
COPY --from=builder /app/public ./

# Custom nginx config for SPA routing
COPY docker/nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
