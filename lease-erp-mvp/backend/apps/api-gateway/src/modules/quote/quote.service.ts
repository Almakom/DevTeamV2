import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CalculationService } from './calculation.service';

@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private calculationService: CalculationService,
  ) {}

  // TODO: Implement full CRUD operations
  // Reference LeadService for implementation pattern
  // - create(tenantId, createQuoteDto)
  // - findAll(tenantId, paginationDto)
  // - findOne(tenantId, id)
  // - update(tenantId, id, updateQuoteDto)
  // - remove(tenantId, id)
  // - approve(tenantId, id, approverId)
  // - convertToContract(tenantId, quoteId)
  // - calculate(calculationParams) - uses CalculationService
}
