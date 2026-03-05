# 🐳 Docker Setup - Tổng Quan

Dự án Gia Phả OS đã được đóng gói hoàn chỉnh với Docker, sẵn sàng cho:
- ✅ Development environment
- ✅ Staging/Demo deployment  
- ✅ Production deployment
- ✅ High availability setup

---

## 📁 Files Đã Tạo

### Core Docker Files

| File | Mô tả | Mục đích |
|------|-------|----------|
| `Dockerfile` | Multi-stage production build | Production optimized |
| `Dockerfile.dev` | Development image | Hot reload |
| `.dockerignore` | Exclude unnecessary files | Build optimization |
| `docker-compose.yml` | Standard deployment | Single instance |
| `docker-compose.dev.yml` | Development setup | Local development |
| `docker-compose.prod.yml` | Production + Nginx | Load balanced |
| `docker-compose.ci.yml` | CI/CD override | Automated testing |

### Helper Files

| File | Mô tả |
|------|-------|
| `docker-setup.sh` | Interactive setup script |
| `Makefile` | Simplified commands |
| `DOCKER_README.md` | Quick reference |
| `docs/DOCKER.md` | Full documentation |
| `nginx.conf` | Load balancer config |
| `.github/workflows/docker.yml` | CI/CD pipeline |

### App Updates

| File | Changes |
|------|---------|
| `next.config.ts` | Added `output: "standalone"` |
| `app/api/health/route.ts` | Health check endpoint |
| `.env.example` | Added Docker variables |
| `.gitignore` | Docker-related patterns |

---

## 🚀 Quick Start Options

### Option 1: Interactive Setup (Recommended)

```bash
./docker-setup.sh
```

### Option 2: Manual Setup

```bash
# Copy environment
cp .env.example .env
nano .env  # Configure Supabase

# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d

# Production + Nginx
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 3: Using Makefile

```bash
make help      # Show all commands
make dev       # Development
make prod      # Production
make logs      # View logs
```

---

## 🏗️ Architecture

### Development Setup

```
┌─────────────────────────┐
│   docker-compose.dev    │
│                         │
│  ┌──────────────────┐   │
│  │   Node.js Dev    │   │
│  │   Port: 3000     │   │
│  │   Hot Reload ON  │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

### Production Setup (Standard)

```
┌─────────────────────────┐
│   docker-compose.yml    │
│                         │
│  ┌──────────────────┐   │
│  │   Next.js App    │   │
│  │   Port: 3000     │   │
│  │   Standalone     │   │
│  └──────────────────┘   │
└─────────────────────────┘
```

### Production Setup (High Availability)

```
┌──────────────────────────────────────┐
│   docker-compose.prod.yml            │
│                                      │
│  ┌────────────────────────┐          │
│  │   Nginx Load Balancer  │          │
│  │   Port: 80             │          │
│  └──────────┬─────────────┘          │
│             │                        │
│     ┌───────┴────────┐               │
│     │                │               │
│  ┌──▼──┐          ┌──▼──┐            │
│  │ App │          │ App │            │
│  │  #1 │          │  #2 │            │
│  └─────┘          └─────┘            │
└──────────────────────────────────────┘
```

---

## 📊 Features

### ✅ Multi-stage Build
- Stage 1: Dependencies installation
- Stage 2: Build application
- Stage 3: Production runtime
- **Result:** ~150MB final image vs ~1GB unoptimized

### ✅ Security
- Non-root user (nextjs:1001)
- Read-only filesystem option
- Security headers (Nginx)
- No secrets in image
- Vulnerability scanning (Trivy)

### ✅ Health Checks
- HTTP endpoint: `/api/health`
- Docker health check built-in
- Auto-restart on failure

### ✅ Monitoring
- Container logs via Docker
- Resource usage tracking
- Health status monitoring
- Nginx access logs

### ✅ Scaling
- Horizontal scaling ready
- Load balancing with Nginx
- Stateless application design
- Docker Swarm compatible

### ✅ CI/CD Ready
- GitHub Actions workflow
- Automated builds
- Security scanning
- Multi-platform support (amd64, arm64)

---

## 🎯 Use Cases

### 1️⃣ Local Development

```bash
# Best for: Daily development
docker-compose -f docker-compose.dev.yml up

# Features:
- Hot reload enabled
- Source code mounted
- Fast iteration
- Full development tools
```

### 2️⃣ Staging/Demo

```bash
# Best for: Feature evaluation
docker-compose up -d

# Features:
- Production-like environment
- Single instance for cost efficiency
- Easy to deploy and tear down
- Perfect for demos
```

### 3️⃣ Production

```bash
# Best for: Live deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Features:
- Load balanced (Nginx)
- Multiple instances
- High availability
- Production optimized
```

---

## 📈 Deployment Scenarios

### Scenario A: VPS/Cloud VM

```bash
# On server
git clone https://github.com/homielab/giapha-os.git
cd giapha-os
cp .env.example .env
nano .env  # Configure
docker-compose up -d
```

**Platforms:** DigitalOcean, Linode, AWS EC2, Azure VM, GCP Compute Engine

### Scenario B: Docker Swarm

```bash
docker swarm init
docker stack deploy -c docker-compose.yml giapha-os
docker stack services giapha-os
```

**Best for:** Multi-node cluster

### Scenario C: Kubernetes

```bash
# Build and push
docker build -t registry.example.com/giapha-os:latest .
docker push registry.example.com/giapha-os:latest

# Deploy
kubectl apply -f k8s/
```

**Best for:** Large scale, enterprise

---

## 🔧 Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key

# Optional
SITE_NAME=Gia Phả OS
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Resource Limits

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
```

### Port Mapping

```yaml
ports:
  - "8080:3000"  # Change external port
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
docker-compose logs app
# Check environment variables
# Check Supabase connectivity
```

### Build fails

```bash
docker-compose build --no-cache
# Check Dockerfile syntax
# Check network connectivity
```

### Performance issues

```bash
# Increase resources
docker-compose up -d --force-recreate

# Check logs
docker stats giapha-os-app
```

---

## 📚 Documentation

- **📖 Full Guide:** [docs/DOCKER.md](docs/DOCKER.md)
- **⚡ Quick Reference:** [DOCKER_README.md](DOCKER_README.md)
- **🔧 Main README:** [README.md](README.md)

---

## 🎓 Example Commands

```bash
# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app sh

# Check health
docker inspect --format='{{.State.Health.Status}}' giapha-os-app

# Resource usage
docker stats giapha-os-app

# Backup environment
make backup

# Update application
make update

# Clean everything
make clean
```

---

## ✅ Validation Checklist

- [x] Dockerfile optimized (multi-stage)
- [x] Docker Compose for all environments
- [x] Health checks configured
- [x] Non-root user
- [x] .dockerignore optimized
- [x] Environment variables templated
- [x] Setup script created
- [x] Makefile for convenience
- [x] Documentation complete
- [x] CI/CD pipeline ready
- [x] Nginx load balancer
- [x] Security best practices
- [x] Monitoring ready

---

## 🚀 Next Steps

1. **Test locally:**
   ```bash
   ./docker-setup.sh
   ```

2. **Deploy to staging:**
   ```bash
   # On server
   git clone <repo>
   cd giapha-os
   cp .env.example .env
   # Edit .env
   docker-compose up -d
   ```

3. **Setup monitoring:**
   - Configure log aggregation
   - Setup alerting
   - Monitor resource usage

4. **Setup CI/CD:**
   - Enable GitHub Actions
   - Configure secrets
   - Test automated deployments

5. **Scale if needed:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale app=3
   ```

---

## 💡 Tips

- Use `make help` for quick command reference
- Always test in staging before production
- Monitor logs regularly: `make logs`
- Backup `.env` before updates: `make backup`
- Use health checks to ensure uptime
- Consider using Docker Swarm for HA
- Regular security scans with Trivy

---

## 🤝 Support

- 📧 Email: [your-email]
- 🐛 Issues: [GitHub Issues](https://github.com/homielab/giapha-os/issues)
- 💬 Discord: [link]

---

**Ready to deploy! 🎉**
