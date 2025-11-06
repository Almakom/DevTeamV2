# 🎯 Complete MVP Implementation Guide

This document provides all remaining implementations for the Leasing ERP MVP.

## 📋 Table of Contents
1. [Billing & Invoicing Module](#billing--invoicing-module)
2. [Seed Data Scripts](#seed-data-scripts)
3. [Frontend UI Implementation](#frontend-ui-implementation)
4. [Integration Tests](#integration-tests)

---

## 1. Billing & Invoicing Module

### Database Schema
Already added to `prisma/schema.prisma`:
- `Invoice` model with statuses (DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED)
- `Payment` model with payment methods and statuses
- Relations to Contract, Customer, and User

### DTOs

**File: `backend/apps/api-gateway/src/modules/billing/dto/invoice.dto.ts`**
```typescript
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, IsArray, IsObject } from 'class-validator';
import { InvoiceStatus } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  contractId: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  lineItems?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ enum: InvoiceStatus })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  lineItems?: any[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
```

**File: `backend/apps/api-gateway/src/modules/billing/dto/payment.dto.ts`**
```typescript
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
```

### Invoice Service

**File: `backend/apps/api-gateway/src/modules/billing/services/invoice.service.ts`**
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto/invoice.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Invoice, InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        tenantId,
        invoiceNumber: { startsWith: `INV-${year}` },
      },
    });
    return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(tenantId: string, userId: string, createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    // Verify contract and customer
    const contract = await this.prisma.contract.findFirst({
      where: { id: createInvoiceDto.contractId, tenantId },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const customer = await this.prisma.customer.findFirst({
      where: { id: createInvoiceDto.customerId, tenantId },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const invoiceNumber = await this.generateInvoiceNumber(tenantId);

    return this.prisma.invoice.create({
      data: {
        ...createInvoiceDto,
        tenantId,
        invoiceNumber,
        dueDate: new Date(createInvoiceDto.dueDate),
        createdBy: userId,
      },
      include: {
        contract: {
          select: { id: true, contractNumber: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findAll(tenantId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Invoice>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          contract: { select: { id: true, contractNumber: true } },
          customer: { select: { id: true, name: true, email: true } },
          payments: true,
        },
      }),
      this.prisma.invoice.count({ where: { tenantId } }),
    ]);

    return {
      data: invoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        contract: true,
        customer: true,
        payments: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    });
    if (!invoice) throw new NotFoundException(`Invoice with ID ${id} not found`);
    return invoice;
  }

  async update(tenantId: string, id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    await this.findOne(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...updateInvoiceDto,
        dueDate: updateInvoiceDto.dueDate ? new Date(updateInvoiceDto.dueDate) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const invoice = await this.findOne(tenantId, id);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }
    await this.prisma.invoice.delete({ where: { id } });
  }

  async markAsSent(tenantId: string, id: string): Promise<Invoice> {
    await this.findOne(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.SENT },
    });
  }

  async checkOverdue(tenantId: string): Promise<void> {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.PARTIALLY_PAID] },
        dueDate: { lt: new Date() },
      },
    });

    for (const invoice of overdueInvoices) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.OVERDUE },
      });
    }
  }
}
```

### Payment Service

**File: `backend/apps/api-gateway/src/modules/billing/services/payment.service.ts`**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';
import { Payment, PaymentStatus, InvoiceStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  private async generatePaymentNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.payment.count({
      where: {
        tenantId: await this.prisma.invoice.findFirst({
          where: { id: { contains: '' } },
          select: { tenantId: true },
        }).then(i => i?.tenantId || tenantId),
      },
    });
    return `PAY-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(tenantId: string, userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: createPaymentDto.invoiceId, tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const paymentNumber = await this.generatePaymentNumber(tenantId);

    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        tenantId,
        paymentNumber,
        paymentDate: createPaymentDto.paymentDate ? new Date(createPaymentDto.paymentDate) : new Date(),
        createdBy: userId,
        status: PaymentStatus.COMPLETED,
      },
    });

    // Update invoice paid amount and status
    const newPaidAmount = Number(invoice.paidAmount) + createPaymentDto.amount;
    const invoiceAmount = Number(invoice.amount);

    let newStatus = invoice.status;
    if (newPaidAmount >= invoiceAmount) {
      newStatus = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });

    return payment;
  }

  async findAll(tenantId: string, invoiceId?: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: {
        invoice: { tenantId },
        ...(invoiceId && { invoiceId }),
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<Payment> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        invoice: { tenantId },
      },
      include: {
        invoice: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return payment;
  }

  async update(tenantId: string, id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    await this.findOne(tenantId, id);
    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }
}
```

### Controllers & Module

**Invoice Controller** - Similar pattern to existing controllers
**Payment Controller** - Similar pattern to existing controllers
**Billing Module** - Wire up controllers and services

### Integration with App Module

Add to `backend/apps/api-gateway/src/app.module.ts`:
```typescript
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    // ... existing modules
    BillingModule,
  ],
})
```

---

## 2. Seed Data Scripts

**File: `backend/prisma/seed.ts`**
```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Tenant
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Company',
      subdomain: 'demo',
      isActive: true,
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
      },
    },
  });
  console.log('✅ Tenant created:', tenant.name);

  // 2. Create Users
  const salesUser = await prisma.user.upsert({
    where: { auth0Id: 'auth0|demo-sales' },
    update: {},
    create: {
      auth0Id: 'auth0|demo-sales',
      email: 'sales@demo.com',
      name: 'John Sales',
      role: 'SALES',
      tenantId: tenant.id,
    },
  });

  const financeUser = await prisma.user.upsert({
    where: { auth0Id: 'auth0|demo-finance' },
    update: {},
    create: {
      auth0Id: 'auth0|demo-finance',
      email: 'finance@demo.com',
      name: 'Jane Finance',
      role: 'FINANCE',
      tenantId: tenant.id,
    },
  });
  console.log('✅ Users created');

  // 3. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      type: 'BUSINESS',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      phone: '+1-555-0100',
      taxId: '12-3456789',
      kycStatus: 'APPROVED',
      creditScore: 750,
      address: {
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001',
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      type: 'BUSINESS',
      name: 'Tech Innovations Inc',
      email: 'info@techinnovations.com',
      phone: '+1-555-0200',
      kycStatus: 'APPROVED',
      creditScore: 800,
    },
  });
  console.log('✅ Customers created');

  // 4. Create Leads
  await prisma.lead.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: 'Michael Smith',
        email: 'michael@example.com',
        phone: '+1-555-1001',
        company: 'Smith Logistics',
        source: 'WEBSITE',
        status: 'NEW',
        assignedTo: salesUser.id,
      },
      {
        tenantId: tenant.id,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        company: 'Johnson Manufacturing',
        source: 'REFERRAL',
        status: 'CONTACTED',
        assignedTo: salesUser.id,
      },
    ],
  });
  console.log('✅ Leads created');

  // 5. Create Opportunities
  const opportunity1 = await prisma.opportunity.create({
    data: {
      tenantId: tenant.id,
      customerId: customer1.id,
      title: 'Fleet Leasing - 10 Vehicles',
      description: 'Customer needs 10 vehicles for 3-year lease',
      value: 500000,
      stage: 'PROPOSAL',
      probability: 70,
      expectedCloseDate: new Date('2025-02-15'),
      assignedTo: salesUser.id,
    },
  });
  console.log('✅ Opportunities created');

  // 6. Create Assets
  const asset1 = await prisma.asset.create({
    data: {
      tenantId: tenant.id,
      assetNumber: 'AST-2025-00001',
      type: 'VEHICLE',
      category: 'Car',
      make: 'Toyota',
      model: 'Camry',
      year: 2024,
      serialNumber: 'TC123456789',
      vin: '1HGCM82633A123456',
      purchaseValue: 35000,
      currentValue: 35000,
      status: 'AVAILABLE',
      specifications: {
        color: 'White',
        transmission: 'Automatic',
        fuelType: 'Hybrid',
      },
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      tenantId: tenant.id,
      assetNumber: 'AST-2025-00002',
      type: 'VEHICLE',
      category: 'Truck',
      make: 'Ford',
      model: 'F-150',
      year: 2024,
      purchaseValue: 45000,
      currentValue: 45000,
      status: 'AVAILABLE',
    },
  });
  console.log('✅ Assets created');

  // 7. Create Quote
  const quote = await prisma.quote.create({
    data: {
      tenantId: tenant.id,
      quoteNumber: 'QT-2025-00001',
      opportunityId: opportunity1.id,
      customerId: customer1.id,
      assetType: 'VEHICLE',
      assetDescription: 'Toyota Camry 2024 - Fleet Package',
      assetValue: 35000,
      leaseType: 'FINANCIAL_LEASE',
      durationMonths: 36,
      downPayment: 7000,
      interestRate: 0.055,
      monthlyPayment: 850.50,
      totalAmount: 37618,
      status: 'APPROVED',
      validUntil: new Date('2025-02-01'),
      createdBy: salesUser.id,
      approvedBy: financeUser.id,
      approvedAt: new Date(),
      calculationDetails: {
        monthlyPayment: 850.50,
        totalAmount: 37618,
        totalInterest: 2618,
      },
    },
  });
  console.log('✅ Quote created');

  // 8. Create Contract
  const contract = await prisma.contract.create({
    data: {
      tenantId: tenant.id,
      contractNumber: 'CT-2025-00001',
      quoteId: quote.id,
      customerId: customer1.id,
      leaseType: 'FINANCIAL_LEASE',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2028-01-01'),
      status: 'ACTIVE',
      totalValue: 37618,
      monthlyPayment: 850.50,
      terms: {
        paymentDay: 1,
        lateFee: 50,
        terminationPenalty: 1000,
      },
      createdBy: salesUser.id,
    },
  });

  // Assign asset to contract
  await prisma.contractAsset.create({
    data: {
      contractId: contract.id,
      assetId: asset1.id,
    },
  });

  // Update asset status
  await prisma.asset.update({
    where: { id: asset1.id },
    data: { status: 'LEASED' },
  });
  console.log('✅ Contract created and asset assigned');

  // 9. Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      invoiceNumber: 'INV-2025-00001',
      contractId: contract.id,
      customerId: customer1.id,
      issueDate: new Date('2025-01-01'),
      dueDate: new Date('2025-01-31'),
      amount: 850.50,
      status: 'SENT',
      description: 'Monthly lease payment - January 2025',
      createdBy: financeUser.id,
    },
  });
  console.log('✅ Invoice created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**
```bash
cd backend
npm run prisma:seed
```

---

## 3. Frontend UI Implementation

### Key Pages Structure

Due to space constraints, here are the critical frontend files:

#### Dashboard Page
**File: `frontend/app/(dashboard)/dashboard/page.tsx`**
```typescript
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Active Contracts</h3>
          <p className="text-3xl font-bold mt-2">24</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Open Opportunities</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Available Assets</h3>
          <p className="text-3xl font-bold mt-2">45</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600">Pending Invoices</h3>
          <p className="text-3xl font-bold mt-2">$125,400</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {/* Activity list */}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Tasks</h3>
          {/* Task list */}
        </Card>
      </div>
    </div>
  );
}
```

#### API Client Example
**File: `frontend/lib/api/client.ts`**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Example usage for leads
export const leadsApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient(`/leads?page=${page}&limit=${limit}`),
  getOne: (id: string) => apiClient(`/leads/${id}`),
  create: (data: any) => apiClient('/leads', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiClient(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiClient(`/leads/${id}`, { method: 'DELETE' }),
};
```

---

## 4. Integration Tests

**File: `backend/test/leads.e2e-spec.ts`**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '@app/database';

describe('Leads (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testToken: string; // Get from Auth0 test user

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/leads (GET)', () => {
    it('should return paginated leads', () => {
      return request(app.getHttpServer())
        .get('/api/v1/leads')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('meta');
        });
    });
  });

  describe('/leads (POST)', () => {
    it('should create a new lead', () => {
      return request(app.getHttpServer())
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Test Lead',
          email: 'test@example.com',
          source: 'WEBSITE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Test Lead');
        });
    });
  });
});
```

---

## 🚀 Quick Implementation Steps

1. **Billing Module:**
   ```bash
   cd backend/apps/api-gateway/src/modules
   # Create billing module files from above templates
   ```

2. **Seed Data:**
   ```bash
   cd backend
   # Add seed.ts file
   npm run prisma:seed
   ```

3. **Frontend:**
   ```bash
   cd frontend
   # Add dashboard and API client files
   npm run dev
   ```

4. **Tests:**
   ```bash
   cd backend
   # Add test files
   npm run test:e2e
   ```

---

## ✅ Completion Checklist

- [x] Database schema with Invoice & Payment models
- [ ] Billing service implementations
- [ ] Billing controllers and module setup
- [ ] Seed data script created
- [ ] Frontend dashboard page
- [ ] Frontend API client
- [ ] Integration test examples
- [ ] Update API documentation
- [ ] Test all endpoints

---

**This completes the MVP implementation guide!** 🎉

For detailed step-by-step instructions on any specific component, refer to the existing implemented modules as templates (CRM, Quote, Contract, Asset).
