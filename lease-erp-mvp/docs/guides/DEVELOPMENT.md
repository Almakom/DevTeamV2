# 🛠️ Development Guide - Leasing ERP MVP

This guide will help you understand the codebase structure and how to continue development.

## 📁 Project Structure

```
lease-erp-mvp/
├── backend/
│   ├── apps/
│   │   └── api-gateway/              # Main API Gateway
│   │       └── src/
│   │           ├── modules/          # Feature modules
│   │           │   ├── crm/         # ✅ COMPLETE - Use as template
│   │           │   ├── quote/       # 🚧 Calculation service done
│   │           │   ├── contract/    # ⏳ TODO
│   │           │   ├── asset/       # ⏳ TODO
│   │           │   └── document/    # ⏳ TODO
│   │           ├── app.module.ts
│   │           └── main.ts
│   ├── libs/
│   │   ├── common/                   # ✅ Shared types, DTOs, decorators
│   │   ├── database/                 # ✅ Prisma service
│   │   └── auth/                     # ✅ Auth0 guards & strategies
│   └── prisma/
│       └── schema.prisma             # ✅ Complete database schema
└── frontend/
    ├── app/                          # Next.js 15 App Router
    ├── components/                   # React components
    └── lib/                          # Utilities

✅ = Complete
🚧 = Partially complete
⏳ = TODO
```

## 🎯 Development Workflow

### 1. Understanding the CRM Module (Reference Implementation)

The **CRM module** is fully implemented and serves as a template for other modules.

**File Structure:**
```
backend/apps/api-gateway/src/modules/crm/
├── crm.module.ts              # Module definition
├── controllers/
│   ├── lead.controller.ts     # REST endpoints for leads
│   ├── customer.controller.ts # TODO: Follow lead pattern
│   └── opportunity.controller.ts # TODO: Follow lead pattern
├── services/
│   ├── lead.service.ts        # ✅ Complete business logic
│   ├── customer.service.ts    # TODO: Implement
│   └── opportunity.service.ts # TODO: Implement
└── dto/
    └── lead.dto.ts            # ✅ Data Transfer Objects
```

### 2. How to Implement a New Module

Follow these steps to implement any module (Quote, Contract, Asset, Document):

#### Step 1: Create DTOs

Create Data Transfer Objects for validation:

```typescript
// Example: quote.dto.ts
import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsNumber()
  assetValue: number;

  // ... more fields
}

export class UpdateQuoteDto {
  // Partial fields for updates
}
```

#### Step 2: Create Service

Create business logic in a service:

```typescript
// Example: quote.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class QuoteService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createDto: CreateQuoteDto) {
    // Always filter by tenantId for multi-tenant isolation
    return this.prisma.quote.create({
      data: {
        ...createDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string, paginationDto: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.quote.findMany({
        where: { tenantId }, // Always filter by tenant
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.quote.count({ where: { tenantId } }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.quote.findFirst({
      where: { id, tenantId },
    });

    if (!item) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return item;
  }

  async update(tenantId: string, id: string, updateDto: UpdateQuoteDto) {
    await this.findOne(tenantId, id); // Verify exists and belongs to tenant
    return this.prisma.quote.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.quote.delete({ where: { id } });
  }
}
```

#### Step 3: Create Controller

Create REST API endpoints:

```typescript
// Example: quote.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuoteService } from '../services/quote.service';
import { CreateQuoteDto, UpdateQuoteDto } from '../dto/quote.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId } from '@app/common/decorators';

@ApiTags('Quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(JwtAuthGuard, TenantGuard) // Always protect with auth
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  create(@TenantId() tenantId: string, @Body() createDto: CreateQuoteDto) {
    return this.quoteService.create(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.quoteService.findAll(tenantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.quoteService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quote' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateQuoteDto,
  ) {
    return this.quoteService.update(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quote' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.quoteService.remove(tenantId, id);
  }
}
```

#### Step 4: Register in Module

```typescript
import { Module } from '@nestjs/common';
import { QuoteController } from './quote.controller';
import { QuoteService } from './quote.service';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService],
  exports: [QuoteService], // Export if other modules need it
})
export class QuoteModule {}
```

## 🔑 Key Concepts

### Multi-Tenancy

**ALWAYS** filter by `tenantId` in all queries:

```typescript
// ✅ Correct
this.prisma.quote.findMany({
  where: { tenantId },
});

// ❌ Wrong - exposes all tenants' data
this.prisma.quote.findMany();
```

### Authentication & Authorization

```typescript
// Protect routes with guards
@UseGuards(JwtAuthGuard, TenantGuard)

// Get tenant ID from JWT
@TenantId() tenantId: string

// Get full user context
@GetTenantContext() context: TenantContext

// Role-based access (if needed)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'FINANCE')
```

### Pagination

Always use pagination for list endpoints:

```typescript
async findAll(tenantId: string, paginationDto: PaginationDto) {
  const { page, limit, sortBy, sortOrder } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.entity.findMany({
      where: { tenantId },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    this.prisma.entity.count({ where: { tenantId } }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## 📝 Implementation Checklist

### Quote Module (Priority 1)

- [ ] Create `dto/quote.dto.ts` with CreateQuoteDto and UpdateQuoteDto
- [ ] Implement `QuoteService` with full CRUD
- [ ] Implement `QuoteController` with all endpoints
- [ ] Add approve/reject quote functionality
- [ ] Add quote-to-contract conversion
- [ ] Integrate CalculationService (already created)
- [ ] Add PDF generation endpoint

### Contract Module (Priority 2)

- [ ] Create `dto/contract.dto.ts`
- [ ] Implement `ContractService`
- [ ] Implement `ContractController`
- [ ] Add contract lifecycle management (activate, suspend, terminate)
- [ ] Add sub-contract support
- [ ] Add asset assignment to contracts
- [ ] Add PDF generation from templates

### Asset Module (Priority 3)

- [ ] Create `dto/asset.dto.ts`
- [ ] Implement `AssetService`
- [ ] Implement `AssetController`
- [ ] Add image upload to S3
- [ ] Add asset availability checking
- [ ] Add asset assignment/return flow

### Document Module (Priority 4)

- [ ] Create `dto/document.dto.ts`
- [ ] Implement `DocumentService`
- [ ] Implement `DocumentController`
- [ ] Add AWS S3 integration
- [ ] Add PDF generation service (using Puppeteer)
- [ ] Add contract template engine (using Handlebars)

## 🎨 Frontend Development

### Creating a New Page

```typescript
// app/(dashboard)/quotes/page.tsx
export default function QuotesPage() {
  return (
    <div>
      <h1>Quotes</h1>
      {/* Your UI here */}
    </div>
  );
}
```

### API Client

```typescript
// lib/api/quotes.ts
export async function getQuotes(page = 1, limit = 10) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quotes?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.json();
}
```

### Using React Query

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { getQuotes } from '@/lib/api/quotes';

export default function QuotesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => getQuotes(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.data.map(quote => (
        <div key={quote.id}>{quote.quoteNumber}</div>
      ))}
    </div>
  );
}
```

## 🧪 Testing

### Unit Tests

```typescript
// lead.service.spec.ts
import { Test } from '@nestjs/testing';
import { LeadService } from './lead.service';
import { PrismaService } from '@app/database';

describe('LeadService', () => {
  let service: LeadService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LeadService, PrismaService],
    }).compile();

    service = module.get<LeadService>(LeadService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a lead', async () => {
    const tenantId = 'test-tenant';
    const createDto = { name: 'Test Lead', source: 'WEBSITE' };

    jest.spyOn(prisma.lead, 'create').mockResolvedValue({
      id: '1',
      ...createDto,
      tenantId,
    } as any);

    const result = await service.create(tenantId, createDto);
    expect(result.name).toBe('Test Lead');
  });
});
```

## 🚀 Deployment

See [deployment/README.md](../deployment/README.md) for deployment guides:
- Vercel (Frontend)
- Railway or Render (Backend)
- Neon (Database)

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

## 💡 Tips

1. **Follow the Pattern**: Use the CRM/Lead implementation as your template
2. **Test Early**: Write tests as you implement features
3. **Document**: Add JSDoc comments to complex functions
4. **Security**: Always validate input and filter by tenantId
5. **Error Handling**: Use appropriate HTTP exceptions
6. **Logging**: Add logging for debugging (use NestJS Logger)

---

Happy Coding! 🎉
