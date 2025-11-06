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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OpportunityService } from '../services/opportunity.service';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateOpportunityStageDto,
} from '../dto/opportunity.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId } from '@app/common/decorators';
import { OpportunityStage } from '@prisma/client';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('opportunities')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity' })
  create(
    @TenantId() tenantId: string,
    @Body() createOpportunityDto: CreateOpportunityDto,
  ) {
    return this.opportunityService.create(tenantId, createOpportunityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.opportunityService.findAll(tenantId, paginationDto);
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Get opportunity pipeline view' })
  getPipeline(@TenantId() tenantId: string) {
    return this.opportunityService.getOpportunityPipeline(tenantId);
  }

  @Get('stage/:stage')
  @ApiOperation({ summary: 'Get opportunities by stage' })
  @ApiQuery({ name: 'stage', enum: OpportunityStage })
  findByStage(
    @TenantId() tenantId: string,
    @Param('stage') stage: OpportunityStage,
  ) {
    return this.opportunityService.findByStage(tenantId, stage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.opportunityService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opportunity' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    return this.opportunityService.update(tenantId, id, updateOpportunityDto);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update opportunity stage' })
  updateStage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateStageDto: UpdateOpportunityStageDto,
  ) {
    return this.opportunityService.updateStage(tenantId, id, updateStageDto);
  }

  @Post(':id/win')
  @ApiOperation({ summary: 'Mark opportunity as won' })
  markAsWon(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.opportunityService.markAsWon(tenantId, id);
  }

  @Post(':id/lose')
  @ApiOperation({ summary: 'Mark opportunity as lost' })
  markAsLost(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.opportunityService.markAsLost(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an opportunity' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.opportunityService.remove(tenantId, id);
  }
}
