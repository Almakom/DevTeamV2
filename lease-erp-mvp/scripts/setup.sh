#!/bin/bash

# Leasing ERP - Quick Setup Script
# This script helps automate the initial setup

set -e

echo "🚀 Leasing ERP - Quick Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) found${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Go back to root
cd ..

# Check for .env files
echo "🔍 Checking environment files..."

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found${NC}"
    echo "   Creating from template..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}   ⚠️  Please update backend/.env with your credentials${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.local not found${NC}"
    echo "   Creating from template..."
    cp frontend/.env.example frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
    echo -e "${YELLOW}   ⚠️  Please update frontend/.env.local with your credentials${NC}"
fi

echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker found. You can use docker-compose for local PostgreSQL:"
    echo "   docker-compose up -d"
    echo ""
fi

echo "📚 Next Steps:"
echo "=============="
echo ""
echo "1. Update your environment files:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Setup Auth0:"
echo "   - Follow docs/SETUP.md for Auth0 configuration"
echo ""
echo "3. Setup Database:"
echo "   - Option A: Use Neon (recommended)"
echo "   - Option B: Use docker-compose up -d for local PostgreSQL"
echo ""
echo "4. Run database migrations:"
echo "   cd backend"
echo "   npx prisma generate"
echo "   npx prisma migrate dev"
echo ""
echo "5. Start development servers:"
echo "   Terminal 1: cd backend && npm run start:dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📖 For detailed instructions, see: docs/SETUP.md"
echo ""
