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
import { CustomerService } from '../services/customer.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateKycStatusDto,
} from '../dto/customer.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId } from '@app/common/decorators';

@ApiTags('CRM')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  create(
    @TenantId() tenantId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customerService.create(tenantId, createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.customerService.findAll(tenantId, paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by email' })
  search(@TenantId() tenantId: string, @Query('email') email: string) {
    return this.customerService.searchByEmail(tenantId, email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customerService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  getStats(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customerService.getCustomerStats(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(tenantId, id, updateCustomerDto);
  }

  @Patch(':id/kyc')
  @ApiOperation({ summary: 'Update customer KYC status' })
  updateKycStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateKycStatusDto: UpdateKycStatusDto,
  ) {
    return this.customerService.updateKycStatus(
      tenantId,
      id,
      updateKycStatusDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.customerService.remove(tenantId, id);
  }
}
