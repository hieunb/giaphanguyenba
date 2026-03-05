# Docker Quick Reference

## 🚀 Quick Start

```bash
# Setup script (recommended)
chmod +x docker-setup.sh
./docker-setup.sh

# Or manual
cp .env.example .env
# Edit .env with your Supabase credentials
docker-compose up -d
```

## 📦 Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Rebuild
docker-compose up -d --build

# Shell access
docker-compose exec app sh

# View status
docker-compose ps
```

## 🛠️ Using Makefile

```bash
make help          # Show all commands
make up            # Start containers
make down          # Stop containers
make logs          # View logs
make shell         # Open shell
make rebuild       # Rebuild and restart
make dev           # Development mode
```

## 🔧 Development vs Production

```bash
# Development (hot reload)
docker-compose -f docker-compose.dev.yml up

# Production (optimized)
docker-compose up -d

# Production + Nginx (load balanced)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

```bash
# Health check
docker inspect --format='{{.State.Health.Status}}' giapha-os-app

# Resource usage
docker stats giapha-os-app

# Container info
docker inspect giapha-os-app
```

## 🐛 Troubleshooting

```bash
# View all logs
docker-compose logs -f

# Clean up
docker-compose down -v
docker system prune -a

# Fresh start
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Full Documentation

See [docs/DOCKER.md](docs/DOCKER.md) for complete guide.
