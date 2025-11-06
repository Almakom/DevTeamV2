import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { CustomerService } from '../services/customer.service';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // TODO: Implement endpoints similar to LeadController
  // - POST /customers
  // - GET /customers
  // - GET /customers/:id
  // - PATCH /customers/:id
  // - DELETE /customers/:id
  // - PATCH /customers/:id/kyc - Update KYC status
  // - POST /customers/:id/documents - Upload KYC documents
}
