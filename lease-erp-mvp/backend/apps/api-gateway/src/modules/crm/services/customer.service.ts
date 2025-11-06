import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement full CRUD operations similar to LeadService
  // - create(tenantId, createCustomerDto)
  // - findAll(tenantId, paginationDto)
  // - findOne(tenantId, id)
  // - update(tenantId, id, updateCustomerDto)
  // - remove(tenantId, id)
  // - updateKycStatus(tenantId, id, kycStatus)
  // - uploadKycDocument(tenantId, id, document)
}
