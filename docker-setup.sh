#!/bin/bash

# ==========================================
# Docker Quick Setup Script
# For Gia Phả OS
# ==========================================

set -e

echo "╔═══════════════════════════════════════╗"
echo "║   Gia Phả OS - Docker Setup          ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found. Creating from .env.example...${NC}"
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env file${NC}"
        echo ""
        echo -e "${YELLOW}⚠ IMPORTANT: Please edit .env file with your Supabase credentials!${NC}"
        echo ""
        echo "Required variables:"
        echo "  - NEXT_PUBLIC_SUPABASE_URL"
        echo "  - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY"
        echo ""
        read -p "Press Enter after you've configured .env file..."
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Validate environment variables
echo ""
echo "Validating environment variables..."

if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env || grep -q "your-project.supabase.co" .env; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL not configured properly!${NC}"
    exit 1
fi

if ! grep -q "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" .env || grep -q "your-anon-key" .env; then
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY not configured properly!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables validated${NC}"
echo ""

# Ask deployment type
echo "Select deployment type:"
echo "1) Development (with hot reload)"
echo "2) Production (optimized build)"
echo "3) Production with Nginx (load balanced)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "Starting development environment..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    2)
        echo ""
        echo "Building production image..."
        docker-compose build
        
        echo ""
        echo "Starting production containers..."
        docker-compose up -d
        
        echo ""
        echo -e "${GREEN}✓ Deployment successful!${NC}"
        echo ""
        echo "Access the application at: http://localhost:3000"
        echo ""
        echo "Useful commands:"
        echo "  View logs:    docker-compose logs -f"
        echo "  Stop:         docker-compose down"
        echo "  Restart:      docker-compose restart"
        ;;
    3)
        echo ""
        echo "Building production image..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
        
        echo ""
        echo "Starting production containers with Nginx..."
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        echo ""
        echo -e "${GREEN}✓ Deployment successful!${NC}"
        echo ""
        echo "Access the application at: http://localhost"
        echo ""
        echo "Useful commands:"
        echo "  View logs:    docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
        echo "  Stop:         docker-compose -f docker-compose.yml -f docker-compose.prod.yml down"
        echo "  Restart:      docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart"
        ;;
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                 ║"
echo "╚═══════════════════════════════════════╝"
