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
import { QuoteService } from './quote.service';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  CalculateQuoteDto,
  ApproveQuoteDto,
} from './dto/quote.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId, CurrentUser } from '@app/common/decorators';
import { QuoteStatus } from '@prisma/client';

@ApiTags('Quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(JwtAuthGuard, TenantGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createQuoteDto: CreateQuoteDto,
  ) {
    return this.quoteService.create(tenantId, user.sub, createQuoteDto);
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate lease without saving' })
  calculate(@Body() calculateQuoteDto: CalculateQuoteDto) {
    return this.quoteService.calculate(calculateQuoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.quoteService.findAll(tenantId, paginationDto);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get quotes by customer' })
  findByCustomer(
    @TenantId() tenantId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.quoteService.findByCustomer(tenantId, customerId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get quotes by status' })
  @ApiQuery({ name: 'status', enum: QuoteStatus })
  findByStatus(
    @TenantId() tenantId: string,
    @Param('status') status: QuoteStatus,
  ) {
    return this.quoteService.findByStatus(tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.quoteService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a quote' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quoteService.update(tenantId, id, updateQuoteDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a quote' })
  approve(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() approveQuoteDto: ApproveQuoteDto,
  ) {
    return this.quoteService.approve(tenantId, id, user.sub, approveQuoteDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a quote' })
  reject(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.quoteService.reject(tenantId, id, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quote' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.quoteService.remove(tenantId, id);
  }
}
