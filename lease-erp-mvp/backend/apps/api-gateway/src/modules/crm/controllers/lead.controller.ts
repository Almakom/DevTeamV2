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
import { LeadService } from '../services/lead.service';
import { CreateLeadDto, UpdateLeadDto } from '../dto/lead.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId } from '@app/common/decorators';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(@TenantId() tenantId: string, @Body() createLeadDto: CreateLeadDto) {
    return this.leadService.create(tenantId, createLeadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.leadService.findAll(tenantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.leadService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadService.update(tenantId, id, updateLeadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.leadService.remove(tenantId, id);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to customer and create opportunity' })
  convertToCustomer(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.leadService.convertToCustomer(tenantId, id);
  }
}
