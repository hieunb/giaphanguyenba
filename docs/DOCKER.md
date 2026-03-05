# Docker Deployment Guide

Hướng dẫn deploy Gia Phả OS bằng Docker cho production hoặc staging environment.

---

## 📋 Yêu cầu

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- Account Supabase đã setup (xem [README.md](../README.md))

---

## 🚀 Quick Start

### 1. Clone & Setup Environment

```bash
# Clone repository
git clone https://github.com/homielab/giapha-os.git
cd giapha-os

# Copy environment file
cp .env.example .env

# Edit .env và điền thông tin Supabase
nano .env
```

### 2. Build & Run

```bash
# Build và start container
docker-compose up -d

# Xem logs
docker-compose logs -f

# Kiểm tra status
docker-compose ps
```

### 3. Truy cập

Mở trình duyệt: `http://localhost:3000`

---

## 📦 Docker Commands

### Production

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app sh
```

### Development

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up

# Rebuild dev image
docker-compose -f docker-compose.dev.yml build --no-cache
```

---

## 🔧 Configuration

### Environment Variables

File `.env` cần có các biến sau:

```env
# REQUIRED
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-anon-key"

# OPTIONAL
SITE_NAME="Gia Phả OS"
NODE_ENV=production
```

### Port Configuration

Mặc định app chạy trên port `3000`. Để thay đổi, edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # External:Internal
```

---

## 🏗️ Architecture

### Multi-stage Build

```
┌─────────────────────────────────────┐
│  Stage 1: deps                      │
│  - Install production dependencies   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Stage 2: builder                   │
│  - Copy dependencies                 │
│  - Build Next.js app                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Stage 3: runner                    │
│  - Copy built assets                 │
│  - Run as non-root user              │
│  - Expose port 3000                  │
└─────────────────────────────────────┘
```

### Health Check

Container có health check tự động:
- Interval: 30s
- Timeout: 10s
- Start period: 40s
- Retries: 3

```bash
# Kiểm tra health status
docker inspect --format='{{.State.Health.Status}}' giapha-os-app
```

---

## 🌐 Deployment Options

### Option 1: Docker Compose (Recommended)

Phù hợp cho VPS hoặc dedicated server.

```bash
# On server
git clone https://github.com/homielab/giapha-os.git
cd giapha-os
cp .env.example .env
# Edit .env with production values
docker-compose up -d
```

### Option 2: Docker Swarm

Phù hợp cho high availability.

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml giapha-os

# View services
docker stack services giapha-os
```

### Option 3: Kubernetes

Phù hợp cho large scale deployment.

```bash
# Build and push image
docker build -t giapha-os:latest .
docker tag giapha-os:latest registry.example.com/giapha-os:latest
docker push registry.example.com/giapha-os:latest

# Apply Kubernetes manifests
kubectl apply -f k8s/
```

---

## 🔐 Security Best Practices

### 1. Use Secrets

Không commit `.env` vào Git. Sử dụng Docker secrets:

```bash
# Create secret
echo "your-secret-key" | docker secret create supabase_key -

# Use in docker-compose.yml
secrets:
  supabase_key:
    external: true
```

### 2. Non-root User

Container chạy với user `nextjs` (UID 1001), không phải root.

### 3. Read-only Filesystem

```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/.next
```

### 4. Resource Limits

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/docker.yml
name: Docker Build & Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t giapha-os:latest .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push giapha-os:latest
```

### GitLab CI

```yaml
# .gitlab-ci.yml
build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

---

## 📊 Monitoring

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Resource Usage

```bash
# Container stats
docker stats giapha-os-app

# Continuous monitoring
watch -n 1 docker stats giapha-os-app
```

### Health Status

```bash
# Check health
docker inspect --format='{{json .State.Health}}' giapha-os-app | jq

# Auto-restart on unhealthy
# (enabled by default with restart: unless-stopped)
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# View logs
docker-compose logs app

# Common issues:
# 1. Missing environment variables
# 2. Port already in use
# 3. Supabase connection failed
```

### Build fails

```bash
# Clean build
docker-compose build --no-cache

# Check Dockerfile syntax
docker build -t test .
```

### Can't connect to Supabase

```bash
# Test inside container
docker-compose exec app sh
wget -O- $NEXT_PUBLIC_SUPABASE_URL

# Check environment variables
docker-compose exec app env | grep SUPABASE
```

### Performance issues

```bash
# Increase memory limit
# Edit docker-compose.yml
deploy:
  resources:
    limits:
      memory: 2G

# Enable caching
docker volume create giapha-cache
# Mount in docker-compose.yml
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build

# Verify
docker-compose ps
docker-compose logs -f
```

### Backup

```bash
# Backup volumes (if any)
docker run --rm -v giapha-os_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Backup environment
cp .env .env.backup
```

### Clean Up

```bash
# Remove stopped containers
docker-compose down

# Remove all (including volumes)
docker-compose down -v

# Clean up Docker system
docker system prune -a
```

---

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### Load Balancer

```yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

---

## 💡 Tips & Tricks

### Development vs Production

```bash
# Development (hot reload)
docker-compose -f docker-compose.dev.yml up

# Production (optimized)
docker-compose up -d
```

### Environment-specific configs

```bash
# Staging
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Debug Mode

```bash
# Run with debug output
docker-compose up --verbose

# Interactive shell
docker-compose exec app sh
```

---

## 📚 References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🤝 Support

- 📧 Email: [your-email]
- 💬 Discord: [link]
- 🐛 Issues: [GitHub Issues](https://github.com/homielab/giapha-os/issues)

---

**Happy Deploying! 🐳**
