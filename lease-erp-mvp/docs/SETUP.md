# 🚀 Setup Guide - Leasing ERP MVP

This guide will help you set up the development environment and get the application running.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm**
- **Git**
- **PostgreSQL** (or Neon account)
- **Auth0 account** (free tier is sufficient)
- **AWS account** (for S3 - optional for initial development)

## 📦 Step 1: Clone and Install Dependencies

```bash
cd lease-erp-mvp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 🗄️ Step 2: Database Setup (Neon PostgreSQL)

### Option A: Using Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. It should look like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database: `createdb lease_erp`
3. Connection string: `postgresql://localhost:5432/lease_erp`

## 🔐 Step 3: Auth0 Setup

### 1. Create Auth0 Tenant

1. Sign up at [auth0.com](https://auth0.com)
2. Create a new tenant (e.g., `your-company-lease-erp`)

### 2. Create API

1. Go to **Applications > APIs**
2. Click **Create API**
3. Name: `Leasing ERP API`
4. Identifier: `https://api.lease-erp.com` (this is your audience)
5. Signing Algorithm: RS256

### 3. Create Application

1. Go to **Applications > Applications**
2. Click **Create Application**
3. Name: `Leasing ERP Frontend`
4. Type: **Single Page Application**
5. Note the **Domain**, **Client ID**, and **Client Secret**

### 4. Configure Application Settings

In your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

### 5. Add Custom Claims (Important!)

Create an Auth0 Action to add tenant and role to JWT:

1. Go to **Actions > Flows > Login**
2. Click **Custom** and create a new action: "Add Tenant Claims"
3. Add this code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://lease-erp.com';

  // Get tenant and role from user metadata
  // For MVP, you can hardcode or fetch from your database
  const tenantId = event.user.app_metadata?.tenantId || 'default-tenant-id';
  const role = event.user.app_metadata?.role || 'SALES';

  api.accessToken.setCustomClaim(`${namespace}/tenantId`, tenantId);
  api.accessToken.setCustomClaim(`${namespace}/role`, role);
  api.idToken.setCustomClaim(`${namespace}/tenantId`, tenantId);
  api.idToken.setCustomClaim(`${namespace}/role`, role);
};
```

4. Click **Deploy**
5. Add the action to your Login flow

## ⚙️ Step 4: Environment Configuration

### Backend Environment

Create `/backend/.env`:

```bash
# Database
DATABASE_URL="postgresql://user:password@hostname:5432/lease_erp?schema=public"

# API Configuration
PORT=4000
NODE_ENV=development
API_PREFIX=api/v1

# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.lease-erp.com
AUTH0_ISSUER_URL=https://your-tenant.auth0.com/

# CORS Settings
CORS_ORIGINS=http://localhost:3000

# AWS S3 (Optional for MVP - comment out if not using)
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=lease-erp-documents
# AWS_ACCESS_KEY_ID=your_access_key_id
# AWS_SECRET_ACCESS_KEY=your_secret_access_key

# JWT Secret (for internal use)
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### Frontend Environment

Create `/frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Auth0 Configuration
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.lease-erp.com

AUTH0_SECRET=use-openssl-rand-hex-32-to-generate-this
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Application
NEXT_PUBLIC_APP_NAME=Leasing ERP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate AUTH0_SECRET:
```bash
openssl rand -hex 32
```

## 🗃️ Step 5: Database Migration

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with test data
# npm run prisma:seed
```

## 🏃 Step 6: Run the Application

### Terminal 1: Backend

```bash
cd backend
npm run start:dev
```

Backend will run on `http://localhost:4000`
API Docs: `http://localhost:4000/api/docs`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## ✅ Step 7: Verify Installation

1. **Backend**: Visit `http://localhost:4000/api/docs` - You should see Swagger documentation
2. **Database**: Run `npx prisma studio` in backend directory to browse your database
3. **Frontend**: Visit `http://localhost:3000` - You should see the landing page

## 🧪 Step 8: Create Test Tenant and User

### Option A: Via Prisma Studio

1. Open Prisma Studio: `cd backend && npx prisma studio`
2. Create a Tenant:
   - id: (auto-generated UUID)
   - name: "Test Company"
   - subdomain: "test-company"
   - isActive: true

3. Sign up via Auth0 in your frontend
4. After first login, update the user in Prisma Studio:
   - Set tenantId to the UUID from step 2
   - Set role to "SUPER_ADMIN"

### Option B: Via Seed Script (Coming Soon)

We'll create a seed script to automate this.

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
cd backend
npx prisma db pull
```

### Auth0 Token Issues

- Verify custom claims action is deployed and added to login flow
- Check that API audience matches in Auth0 and .env files
- Ensure JWT is being sent in Authorization header: `Bearer <token>`

### CORS Issues

- Verify CORS_ORIGINS in backend .env includes your frontend URL
- Check browser console for specific CORS errors

### Module Not Found Errors

```bash
# Backend
cd backend
npm install
npx prisma generate

# Frontend
cd frontend
npm install
```

## 📚 Next Steps

1. **Review the Architecture**: Read [PROJECT_PLAN.md](../PROJECT_PLAN.md)
2. **Start Development**: See [DEVELOPMENT.md](./guides/DEVELOPMENT.md)
3. **Implement Remaining Modules**: Follow the patterns in CRM module
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: See [deployment/README.md](./deployment/README.md)

## 🆘 Getting Help

- Check the [PROJECT_PLAN.md](../PROJECT_PLAN.md) for architecture overview
- Review existing code in `backend/apps/api-gateway/src/modules/crm/` for implementation patterns
- Check Auth0 documentation for authentication issues
- Check Prisma documentation for database issues

---

**Setup Complete! 🎉** You're ready to start developing!
