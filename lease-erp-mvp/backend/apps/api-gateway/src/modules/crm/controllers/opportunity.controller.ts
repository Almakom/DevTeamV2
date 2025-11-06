import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { OpportunityService } from '../services/opportunity.service';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('opportunities')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  // TODO: Implement endpoints similar to LeadController
  // - POST /opportunities
  // - GET /opportunities
  // - GET /opportunities/:id
  // - PATCH /opportunities/:id
  // - DELETE /opportunities/:id
  // - PATCH /opportunities/:id/stage - Update stage
  // - POST /opportunities/:id/win - Mark as won
  // - POST /opportunities/:id/lose - Mark as lost
}
