# 🏢 Leasing Management ERP - MVP Project Plan

## 📋 Project Overview

**Goal**: Build a comprehensive SaaS ERP system for leasing management focused on vehicle and equipment financial leasing.

**Tech Stack**:
- Frontend: Next.js 15 + Shadcn UI + Tailwind CSS
- Backend: NestJS (Microservices)
- Database: Neon PostgreSQL
- Authentication: Auth0
- File Storage: AWS S3
- API: REST

---

## 🎯 MVP Modules (Priority Order)

### 1. **CRM & Opportunity Management**
- Lead capture and management
- Customer profiles with KYC
- Opportunity pipeline
- Scoring module for credit assessment

### 2. **Quote & Calculation Engine**
- Financial lease calculations (simple amortization)
- Quote generation with multiple scenarios
- PDF proposal generation
- Approval workflow

### 3. **Contract Management**
- Contract lifecycle (create, active, renewal, termination)
- Template-based contract generation
- Sub-contract support for modifications
- Digital signature ready (Phase 2: DocuSign)

### 4. **Asset / Fleet Management**
- Asset registration (vehicles, equipment)
- Asset assignment to contracts
- Status tracking (available, leased, maintenance, retired)
- Integration-ready for telematics (Phase 2)

---

## 🏗️ Architecture

### Multi-Tenant Strategy
- Shared database with tenant_id isolation
- Tenant context enforced at middleware level
- Row-level security (RLS) in PostgreSQL

### Microservices Structure
```
backend/
├── apps/
│   ├── api-gateway/          # Main REST API entry point
│   ├── crm-service/          # CRM, Leads, Customers, KYC
│   ├── quote-service/        # Quotes & Calculation Engine
│   ├── contract-service/     # Contract Management
│   ├── asset-service/        # Fleet/Asset Management
│   ├── billing-service/      # Invoicing (Phase 2)
│   ├── document-service/     # PDF generation, S3 uploads
│   └── notification-service/ # Email/SMS (Phase 2)
└── libs/
    ├── common/              # Shared types, DTOs
    ├── database/            # Prisma client, migrations
    └── auth/                # Auth0 guards, decorators
```

### Frontend Structure
```
frontend/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth pages (login, callback)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── crm/
│   │   ├── quotes/
│   │   ├── contracts/
│   │   └── assets/
│   └── api/               # API routes (Auth0 callback)
├── components/
│   ├── ui/                # Shadcn components
│   ├── crm/              # CRM-specific components
│   ├── quotes/           # Quote components
│   ├── contracts/        # Contract components
│   └── assets/           # Asset components
└── lib/
    ├── api/              # API client (fetch wrappers)
    ├── auth/             # Auth0 client config
    └── utils/            # Utilities
```

---

## 💾 Database Schema Overview

### Core Tables

#### **Tenants**
```sql
- id (uuid, PK)
- name (string)
- subdomain (string, unique)
- settings (jsonb)
- created_at, updated_at
```

#### **Users**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- auth0_id (string, unique)
- email (string)
- role (enum: super_admin, sales, operations, finance, customer)
- created_at, updated_at
```

### CRM Module

#### **Leads**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- name, email, phone, company
- source (enum: website, referral, cold_call, etc.)
- status (enum: new, contacted, qualified, converted, lost)
- assigned_to (uuid, FK -> users)
- score (int, nullable)
- created_at, updated_at
```

#### **Customers**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- type (enum: individual, business)
- name, email, phone
- tax_id, address (jsonb)
- kyc_status (enum: pending, approved, rejected)
- kyc_documents (jsonb[])
- credit_score (int, nullable)
- created_at, updated_at
```

#### **Opportunities**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- customer_id (uuid, FK)
- lead_id (uuid, FK, nullable)
- title, description
- value (decimal)
- stage (enum: prospecting, qualification, proposal, negotiation, closed_won, closed_lost)
- probability (int, 0-100)
- expected_close_date (date)
- assigned_to (uuid, FK -> users)
- created_at, updated_at
```

### Quote Module

#### **Quotes**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- opportunity_id (uuid, FK, nullable)
- customer_id (uuid, FK)
- quote_number (string, unique per tenant)
- asset_type (enum: vehicle, equipment, other)
- asset_description (text)
- asset_value (decimal)
- lease_type (enum: financial_lease, operating_lease, rental, lease_to_own)
- duration_months (int)
- down_payment (decimal)
- interest_rate (decimal)
- monthly_payment (decimal)
- total_amount (decimal)
- status (enum: draft, sent, approved, rejected, expired)
- valid_until (date)
- calculation_details (jsonb)
- created_by (uuid, FK -> users)
- approved_by (uuid, FK -> users, nullable)
- created_at, updated_at
```

### Contract Module

#### **Contracts**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- contract_number (string, unique per tenant)
- quote_id (uuid, FK, nullable)
- customer_id (uuid, FK)
- lease_type (enum)
- start_date, end_date
- status (enum: draft, active, suspended, terminated, completed)
- parent_contract_id (uuid, FK, nullable) -- for sub-contracts
- terms (jsonb) -- stores payment schedule, terms & conditions
- total_value (decimal)
- monthly_payment (decimal)
- signed_at (timestamp, nullable)
- signed_document_url (string, nullable)
- created_by (uuid, FK -> users)
- created_at, updated_at
```

#### **Contract_Assets** (Junction table)
```sql
- id (uuid, PK)
- contract_id (uuid, FK)
- asset_id (uuid, FK)
- assigned_at (timestamp)
- returned_at (timestamp, nullable)
```

### Asset Module

#### **Assets**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- asset_number (string, unique per tenant)
- type (enum: vehicle, equipment, other)
- category (string) -- car, truck, forklift, computer, etc.
- make, model, year
- serial_number, vin
- purchase_date, purchase_value (decimal)
- current_value (decimal)
- status (enum: available, leased, maintenance, retired)
- location (string, nullable)
- specifications (jsonb) -- flexible specs
- images (string[]) -- S3 URLs
- created_at, updated_at
```

#### **Asset_Maintenance** (Phase 2)
```sql
- id (uuid, PK)
- asset_id (uuid, FK)
- type (enum: scheduled, repair, inspection)
- description, cost
- scheduled_date, completed_date
- created_at, updated_at
```

### Document Module

#### **Documents**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- entity_type (enum: contract, customer, asset, quote)
- entity_id (uuid)
- type (enum: contract_pdf, kyc_document, invoice, photo, other)
- filename, file_url (S3)
- mime_type, file_size
- uploaded_by (uuid, FK -> users)
- created_at
```

---

## 🔐 Authentication & Authorization

### Auth0 Configuration
- **Tenant**: Create Auth0 tenant
- **Application**: Single Page Application (SPA) for Next.js
- **API**: Register backend API
- **Roles**:
  - `super_admin`, `sales`, `operations`, `finance`, `customer`
- **Rules/Actions**: Add tenant_id to JWT claims

### Multi-Tenant Flow
1. User logs in via Auth0
2. Backend verifies JWT and extracts `tenant_id` from claims
3. All DB queries automatically filtered by `tenant_id`
4. Middleware enforces tenant context

---

## 🧮 Calculation Engine (Simple MVP)

### Financial Lease Calculation
```typescript
// Simple amortization formula
Monthly Payment = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
P = Principal (Asset Value - Down Payment)
r = Monthly interest rate (Annual Rate / 12)
n = Number of months
```

### Features:
- Calculate monthly payment
- Generate amortization schedule
- Support down payment
- Apply interest rate
- Calculate total cost

### Phase 2 Enhancements:
- Residual value calculations
- Tax implications
- Early termination penalties
- Variable rate support

---

## 📁 File Structure

```
lease-erp-mvp/
├── backend/
│   ├── apps/
│   │   ├── api-gateway/
│   │   ├── crm-service/
│   │   ├── quote-service/
│   │   ├── contract-service/
│   │   ├── asset-service/
│   │   └── document-service/
│   ├── libs/
│   │   ├── common/
│   │   ├── database/
│   │   └── auth/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── nest-cli.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── docs/
│   ├── api/
│   └── deployment/
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Development Phases

### **Phase 1: Foundation (Week 1-2)**
✅ Setup:
- [ ] Initialize monorepo
- [ ] Configure NestJS microservices
- [ ] Setup Next.js 15 + Shadcn
- [ ] Configure Auth0
- [ ] Setup Neon PostgreSQL + Prisma
- [ ] Create base schemas

### **Phase 2: CRM Module (Week 2-3)**
- [ ] Lead management CRUD
- [ ] Customer management CRUD
- [ ] KYC workflow
- [ ] Simple scoring module
- [ ] Opportunity pipeline UI

### **Phase 3: Quote & Calculation (Week 3-4)**
- [ ] Calculation engine
- [ ] Quote creation and management
- [ ] PDF generation
- [ ] Approval workflow

### **Phase 4: Contract Management (Week 4-5)**
- [ ] Contract CRUD
- [ ] Contract generation from quotes
- [ ] Template engine
- [ ] Contract lifecycle management
- [ ] Sub-contract support

### **Phase 5: Asset Management (Week 5-6)**
- [ ] Asset registration
- [ ] Asset assignment to contracts
- [ ] Status tracking
- [ ] Image uploads to S3
- [ ] Asset search and filters

### **Phase 6: Integration & Polish (Week 6-7)**
- [ ] Dashboard with key metrics
- [ ] Search and filtering across all modules
- [ ] Notifications (basic email)
- [ ] Audit logs
- [ ] Testing and bug fixes

### **Phase 7: Deployment (Week 7)**
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Railway/Render
- [ ] Configure Auth0 production
- [ ] Setup AWS S3
- [ ] Documentation

---

## 🎨 UI/UX Guidelines

### Design System
- **Shadcn UI components** - consistent, accessible
- **Tailwind CSS** - utility-first styling
- **Responsive design** - mobile, tablet, desktop
- **Dark mode support** - optional for Phase 2

### Key Screens
1. **Dashboard** - KPIs, recent activity, quick actions
2. **CRM** - Lead list, customer cards, opportunity kanban
3. **Quotes** - Quote list, calculator form, PDF preview
4. **Contracts** - Contract list, timeline view, document viewer
5. **Assets** - Asset grid/list, asset details, status badges
6. **Customer Portal** - View contracts, download documents

---

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:pass@neon.tech/lease_erp
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.lease-erp.com
AWS_S3_BUCKET=lease-erp-documents
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=xxx
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.lease-erp.com
AUTH0_SECRET=xxx
```

---

## 📊 Success Metrics for MVP

- ✅ User can create and manage leads
- ✅ User can convert lead to customer with KYC
- ✅ User can generate quote with calculation
- ✅ User can convert quote to contract
- ✅ User can register and assign assets
- ✅ User can view contract details and download PDF
- ✅ Multi-tenant isolation working correctly
- ✅ Authentication and authorization working
- ✅ Responsive UI working on desktop and mobile

---

## 🔄 Future Enhancements (Post-MVP)

### Phase 2
- Billing & Invoicing automation
- Payment processing (Stripe integration)
- Advanced reporting and analytics
- Maintenance scheduling
- DocuSign integration
- Email/SMS notifications

### Phase 3
- Mobile app (React Native)
- Telematics integration (Smartcar, High Mobility)
- QuickBooks/Xero integration
- Advanced calculation engine
- Multi-currency support
- White-label capability

---

## 📚 Documentation Requirements

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] User manual
- [ ] Developer setup guide
- [ ] Architecture decision records (ADRs)

---

**Last Updated**: 2025-11-06
**Status**: Planning Complete → Ready for Implementation
