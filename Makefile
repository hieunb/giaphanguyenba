# ==========================================
# Makefile for Docker Operations
# Simplify Docker commands
# ==========================================

.PHONY: help build up down restart logs shell clean dev prod

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV_FILE := docker-compose.dev.yml
SERVICE_NAME := app

## help: Show this help message
help:
	@echo "Gia Phả OS - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk '/^##/ { \
		split($$0, arr, ":"); \
		printf "  %-15s %s\n", substr(arr[1], 4), arr[2]; \
	}' $(MAKEFILE_LIST)

## build: Build Docker image
build:
	@echo "Building Docker image..."
	docker-compose -f $(COMPOSE_FILE) build

## up: Start containers in detached mode
up:
	@echo "Starting containers..."
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "Containers started! Access at http://localhost:3000"

## down: Stop and remove containers
down:
	@echo "Stopping containers..."
	docker-compose -f $(COMPOSE_FILE) down

## restart: Restart containers
restart:
	@echo "Restarting containers..."
	docker-compose -f $(COMPOSE_FILE) restart

## logs: View container logs
logs:
	docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE_NAME)

## logs-all: View all containers logs
logs-all:
	docker-compose -f $(COMPOSE_FILE) logs -f

## shell: Open shell in container
shell:
	docker-compose -f $(COMPOSE_FILE) exec $(SERVICE_NAME) sh

## ps: List running containers
ps:
	docker-compose -f $(COMPOSE_FILE) ps

## clean: Remove containers, volumes, and images
clean:
	@echo "Cleaning up..."
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -f
	@echo "Cleanup complete!"

## dev: Start development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f $(COMPOSE_DEV_FILE) up

## dev-build: Build and start development environment
dev-build:
	@echo "Building development environment..."
	docker-compose -f $(COMPOSE_DEV_FILE) up --build

## prod: Build and start production environment
prod: build up

## rebuild: Rebuild and restart containers
rebuild:
	@echo "Rebuilding containers..."
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "Rebuild complete!"

## stop: Stop containers without removing
stop:
	@echo "Stopping containers..."
	docker-compose -f $(COMPOSE_FILE) stop

## start: Start stopped containers
start:
	@echo "Starting containers..."
	docker-compose -f $(COMPOSE_FILE) start

## health: Check container health
health:
	@docker inspect --format='{{.State.Health.Status}}' giapha-os-app 2>/dev/null || echo "Container not running"

## stats: Show container resource usage
stats:
	docker stats giapha-os-app --no-stream

## backup: Backup environment file
backup:
	@echo "Backing up .env file..."
	@cp .env .env.backup.$$(date +%Y%m%d_%H%M%S)
	@echo "Backup created!"

## update: Pull latest code and rebuild
update:
	@echo "Updating application..."
	git pull
	make rebuild
	@echo "Update complete!"
