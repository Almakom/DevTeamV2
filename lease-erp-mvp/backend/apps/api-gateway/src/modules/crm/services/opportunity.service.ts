import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class OpportunityService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement full CRUD operations similar to LeadService
  // - create(tenantId, createOpportunityDto)
  // - findAll(tenantId, paginationDto)
  // - findOne(tenantId, id)
  // - update(tenantId, id, updateOpportunityDto)
  // - remove(tenantId, id)
  // - updateStage(tenantId, id, stage)
  // - markAsWon(tenantId, id)
  // - markAsLost(tenantId, id)
}
