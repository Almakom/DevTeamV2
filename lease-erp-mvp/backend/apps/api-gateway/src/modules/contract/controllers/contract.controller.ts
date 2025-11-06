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
import { ContractService } from '../services/contract.service';
import {
  CreateContractDto,
  UpdateContractDto,
  AssignAssetsDto,
  SignContractDto,
} from '../dto/contract.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId, CurrentUser } from '@app/common/decorators';
import { ContractStatus } from '@prisma/client';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contract' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createContractDto: CreateContractDto,
  ) {
    return this.contractService.create(tenantId, user.sub, createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contracts with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.contractService.findAll(tenantId, paginationDto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get contracts by customer' })
  findByCustomer(
    @TenantId() tenantId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.contractService.findByCustomer(tenantId, customerId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get contracts by status' })
  @ApiQuery({ name: 'status', enum: ContractStatus })
  findByStatus(
    @TenantId() tenantId: string,
    @Param('status') status: ContractStatus,
  ) {
    return this.contractService.findByStatus(tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contract by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contractService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractService.update(tenantId, id, updateContractDto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a contract' })
  activate(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contractService.activate(tenantId, id);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend a contract' })
  suspend(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.contractService.suspend(tenantId, id, reason);
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate a contract' })
  terminate(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.contractService.terminate(tenantId, id, reason);
  }

  @Post(':id/assets')
  @ApiOperation({ summary: 'Assign assets to contract' })
  assignAssets(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() assignAssetsDto: AssignAssetsDto,
  ) {
    return this.contractService.assignAssets(tenantId, id, assignAssetsDto);
  }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Sign a contract' })
  signContract(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() signContractDto: SignContractDto,
  ) {
    return this.contractService.signContract(tenantId, id, signContractDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contract' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contractService.remove(tenantId, id);
  }
}
