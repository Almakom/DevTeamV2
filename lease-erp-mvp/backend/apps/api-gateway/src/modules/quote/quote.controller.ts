import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { QuoteService } from './quote.service';

@ApiTags('Quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(JwtAuthGuard, TenantGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  // TODO: Implement CRUD endpoints similar to LeadController
  // - POST /quotes - Create quote
  // - GET /quotes - List all quotes
  // - GET /quotes/:id - Get quote by ID
  // - PATCH /quotes/:id - Update quote
  // - DELETE /quotes/:id - Delete quote
  // - POST /quotes/:id/approve - Approve quote
  // - POST /quotes/:id/convert - Convert quote to contract
  // - POST /quotes/calculate - Calculate lease without saving
}
