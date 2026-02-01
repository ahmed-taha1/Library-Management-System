#!/bin/bash

set -e

echo "=========================================="
echo "Library Management System - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please update .env with your configuration before running in production${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Start Docker containers (database only)
echo ""
echo -e "${YELLOW}Starting database container...${NC}"
docker-compose up -d postgres
echo -e "${GREEN}✓ Database container started${NC}"

# Wait for database to be ready
echo ""
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo -e "${GREEN}✓ Database is ready${NC}"

# Generate Prisma client
echo ""
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Run database migrations
echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations applied${NC}"

# Seed database (optional)
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Seeding database...${NC}"
    npx prisma db seed
    echo -e "${GREEN}✓ Database seeded${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Setup complete!${NC}"
echo "=========================================="
echo ""
echo "To start the development server:"
echo "  npm run start:dev"
echo ""
echo "To start with Docker:"
echo "  docker-compose up --build"
echo ""
echo "API will be available at: http://localhost:4001/api"
echo ""
