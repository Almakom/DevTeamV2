# 🏢 Leasing Management ERP - MVP

A comprehensive SaaS ERP system for vehicle and equipment leasing management.

## 🚀 Tech Stack

- **Frontend**: Next.js 15, Shadcn UI, Tailwind CSS
- **Backend**: NestJS (Microservices Architecture)
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: Auth0
- **File Storage**: AWS S3
- **API**: REST

## 📦 Project Structure

```
lease-erp-mvp/
├── backend/          # NestJS microservices
├── frontend/         # Next.js 15 application
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

## 🎯 MVP Modules

1. **CRM & Opportunity Management** - Lead capture, customer management, KYC, scoring
2. **Quote & Calculation Engine** - Financial lease calculations, quote generation
3. **Contract Management** - Contract lifecycle, template generation, sub-contracts
4. **Asset / Fleet Management** - Asset registration, tracking, assignment

## 🏗️ Architecture

### Multi-Tenant SaaS
- Shared database with tenant isolation
- Row-level security (RLS)
- Tenant context enforced at middleware level

### Microservices
- `api-gateway` - Main REST API entry point
- `crm-service` - CRM, Leads, Customers, KYC
- `quote-service` - Quotes & Calculation Engine
- `contract-service` - Contract Management
- `asset-service` - Fleet/Asset Management
- `document-service` - PDF generation, S3 uploads

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL (Neon account)
- Auth0 account
- AWS account (for S3)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npx prisma migrate dev
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

Visit `http://localhost:3000`

## 📚 Documentation

- [Project Plan](../PROJECT_PLAN.md)
- [API Documentation](./docs/api/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Database Schema](./docs/database-schema.md)

## 🔐 Environment Variables

See `.env.example` files in backend and frontend directories.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## 📝 License

MIT

## 👥 Contributing

This is an MVP project. Contributions welcome!

---

**Version**: 1.0.0-MVP
**Last Updated**: 2025-11-06
