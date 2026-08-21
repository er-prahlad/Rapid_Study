# RapidStudy - Deployment Guide

## Deployment Architecture

```
Internet
    │
    ▼
┌───────────────┐
│  Nginx        │  (SSL Termination, Reverse Proxy)
│  Port 80/443  │
└───────┬───────┘
        │
    ┌───┴────────────────┬────────────────┐
    │                    │                │
┌───▼────────┐   ┌───────▼──────┐   ┌───▼──────┐
│  Frontend  │   │    Admin     │   │  Backend │
│  (Next.js) │   │  (Next.js)   │   │ (Spring) │
│  Port 3000 │   │  Port 3001   │   │ Port 8080│
└────────────┘   └──────────────┘   └────┬─────┘
                                          │
                                    ┌─────┴──────┐
                                    │            │
                              ┌─────▼────┐  ┌────▼────┐
                              │  MySQL   │  │  Redis  │
                              │  Port    │  │  Port   │
                              │  3306    │  │  6379   │
                              └──────────┘  └─────────┘
```

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Small-Medium Scale)

#### Prerequisites

- VPS/Cloud Server (2GB+ RAM, 2+ CPU cores)
- Ubuntu 22.04 LTS or similar
- Docker & Docker Compose installed
- Domain names configured
- SSL certificates (Let's Encrypt)

#### Steps

1. **Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

2. **Clone Repository**

```bash
git clone <repository-url>
cd rapidstudy
```

3. **Configure Environment**

```bash
cp .env.example .env
nano .env
```

Update production values:
```env
APP_ENV=production
APP_URL=https://rapidstudy.com
ADMIN_URL=https://admin.rapidstudy.com
BACKEND_URL=https://api.rapidstudy.com

DB_HOST=mysql
DB_PORT=3306
DB_NAME=rapidstudy
DB_USERNAME=rapidstudy_user
DB_PASSWORD=<strong_password>

REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=<generate_secure_random_string_32+_chars>
JWT_EXPIRATION=86400000

CORS_ALLOWED_ORIGINS=https://rapidstudy.com,https://admin.rapidstudy.com
```

4. **Build Images**

```bash
docker compose -f docker-compose.prod.yml build
```

5. **Start Services**

```bash
docker compose -f docker-compose.prod.yml up -d
```

6. **Verify Deployment**

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
docker compose logs admin
```

7. **Configure Nginx (on host or as container)**

See Nginx configuration section below.

---

### Option 2: Kubernetes (For High Scale)

Coming in future documentation.

---

## Docker Production Configuration

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: rapidstudy-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - rapidstudy-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: rapidstudy-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    networks:
      - rapidstudy-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend/Dockerfile
    container_name: rapidstudy-backend
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION}
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - rapidstudy-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/frontend/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${BACKEND_URL}/api
    container_name: rapidstudy-frontend
    restart: unless-stopped
    networks:
      - rapidstudy-network

  admin:
    build:
      context: ./admin
      dockerfile: ../docker/admin/Dockerfile
      args:
        NEXT_PUBLIC_ADMIN_API_URL: ${BACKEND_URL}/api
    container_name: rapidstudy-admin
    restart: unless-stopped
    networks:
      - rapidstudy-network

  nginx:
    image: nginx:alpine
    container_name: rapidstudy-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
      - admin
    networks:
      - rapidstudy-network

volumes:
  mysql-data:
  redis-data:

networks:
  rapidstudy-network:
    driver: bridge
```

---

## Dockerfile Examples

### Backend Dockerfile

```dockerfile
# docker/backend/Dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend Dockerfile

```dockerfile
# docker/frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/next.config.js ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Nginx Configuration

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    upstream frontend {
        server frontend:3000;
    }

    upstream admin {
        server admin:3001;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name rapidstudy.com www.rapidstudy.com admin.rapidstudy.com api.rapidstudy.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend (Student App)
    server {
        listen 443 ssl http2;
        server_name rapidstudy.com www.rapidstudy.com;

        ssl_certificate /etc/nginx/ssl/rapidstudy.com.crt;
        ssl_certificate_key /etc/nginx/ssl/rapidstudy.com.key;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Admin Panel
    server {
        listen 443 ssl http2;
        server_name admin.rapidstudy.com;

        ssl_certificate /etc/nginx/ssl/admin.rapidstudy.com.crt;
        ssl_certificate_key /etc/nginx/ssl/admin.rapidstudy.com.key;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://admin;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.rapidstudy.com;

        ssl_certificate /etc/nginx/ssl/api.rapidstudy.com.crt;
        ssl_certificate_key /etc/nginx/ssl/api.rapidstudy.com.key;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # CORS headers (if needed)
            add_header 'Access-Control-Allow-Origin' 'https://rapidstudy.com, https://admin.rapidstudy.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        }
    }
}
```

---

## SSL Certificate Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificates
sudo certbot --nginx -d rapidstudy.com -d www.rapidstudy.com
sudo certbot --nginx -d admin.rapidstudy.com
sudo certbot --nginx -d api.rapidstudy.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Database Backup

### Automated Daily Backup Script

```bash
#!/bin/bash
# /root/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
mkdir -p $BACKUP_DIR

docker compose exec -T mysql mysqldump \
  -u rapidstudy_user \
  -p$DB_PASSWORD \
  rapidstudy | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Cron Job

```bash
crontab -e

# Add line:
0 2 * * * /root/backup-db.sh
```

---

## Monitoring

### Health Checks

```bash
# Backend health
curl https://api.rapidstudy.com/actuator/health

# Frontend
curl https://rapidstudy.com

# Admin
curl https://admin.rapidstudy.com
```

### Logs

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Last 100 lines
docker compose logs --tail=100 backend
```

---

## Scaling

### Horizontal Scaling (Multiple Backend Instances)

```yaml
backend:
  deploy:
    replicas: 3
  # ... other config
```

### Load Balancer

Update Nginx upstream:
```nginx
upstream backend {
    least_conn;
    server backend-1:8080;
    server backend-2:8080;
    server backend-3:8080;
}
```

---

## Rollback Procedure

```bash
# Stop current deployment
docker compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit>

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Verify
docker compose ps
```

---

## Security Checklist

- [ ] HTTPS enabled with valid SSL
- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] SSH key-based authentication (disable password)
- [ ] Database not exposed to public
- [ ] Redis not exposed to public
- [ ] Strong passwords in `.env`
- [ ] JWT secret is random and secure
- [ ] Regular security updates
- [ ] Fail2ban installed
- [ ] Backups configured and tested

---

**Document Version:** 1.0  
**Last Updated:** 2026-08-21
