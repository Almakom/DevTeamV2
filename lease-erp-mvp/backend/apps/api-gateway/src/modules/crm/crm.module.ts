import { Module } from '@nestjs/common';
import { LeadController } from './controllers/lead.controller';
import { CustomerController } from './controllers/customer.controller';
import { OpportunityController } from './controllers/opportunity.controller';
import { LeadService } from './services/lead.service';
import { CustomerService } from './services/customer.service';
import { OpportunityService } from './services/opportunity.service';

@Module({
  controllers: [LeadController, CustomerController, OpportunityController],
  providers: [LeadService, CustomerService, OpportunityService],
  exports: [LeadService, CustomerService, OpportunityService],
})
export class CrmModule {}
