import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateQuoteDto,
  UpdateQuoteDto,
  CalculateQuoteDto,
  ApproveQuoteDto,
} from './dto/quote.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Quote, QuoteStatus } from '@prisma/client';
import { CalculationService } from './calculation.service';

@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private calculationService: CalculationService,
  ) {}

  private async generateQuoteNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count({
      where: {
        tenantId,
        quoteNumber: {
          startsWith: `QT-${year}`,
        },
      },
    });

    return `QT-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(
    tenantId: string,
    userId: string,
    createQuoteDto: CreateQuoteDto,
  ): Promise<Quote> {
    // Verify customer exists
    const customer = await this.prisma.customer.findFirst({
      where: { id: createQuoteDto.customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // If opportunityId is provided, verify it exists
    if (createQuoteDto.opportunityId) {
      const opportunity = await this.prisma.opportunity.findFirst({
        where: { id: createQuoteDto.opportunityId, tenantId },
      });

      if (!opportunity) {
        throw new NotFoundException('Opportunity not found');
      }
    }

    // Calculate lease details
    const calculation = this.calculationService.calculate({
      assetValue: createQuoteDto.assetValue,
      downPayment: createQuoteDto.downPayment || 0,
      interestRate: createQuoteDto.interestRate,
      durationMonths: createQuoteDto.durationMonths,
      leaseType: createQuoteDto.leaseType,
    });

    // Generate quote number
    const quoteNumber = await this.generateQuoteNumber(tenantId);

    // Set default valid until date (30 days from now)
    const validUntil =
      createQuoteDto.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return this.prisma.quote.create({
      data: {
        tenantId,
        quoteNumber,
        opportunityId: createQuoteDto.opportunityId,
        customerId: createQuoteDto.customerId,
        assetType: createQuoteDto.assetType,
        assetDescription: createQuoteDto.assetDescription,
        assetValue: createQuoteDto.assetValue,
        leaseType: createQuoteDto.leaseType,
        durationMonths: createQuoteDto.durationMonths,
        downPayment: createQuoteDto.downPayment || 0,
        interestRate: createQuoteDto.interestRate,
        monthlyPayment: calculation.monthlyPayment,
        totalAmount: calculation.totalAmount,
        calculationDetails: calculation,
        validUntil,
        notes: createQuoteDto.notes,
        createdBy: userId,
        status: QuoteStatus.DRAFT,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            stage: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Quote>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      this.prisma.quote.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
            },
          },
          opportunity: {
            select: {
              id: true,
              title: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.quote.count({ where: { tenantId } }),
    ]);

    return {
      data: quotes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Quote> {
    const quote = await this.prisma.quote.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        opportunity: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
            status: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote with ID ${id} not found`);
    }

    return quote;
  }

  async update(
    tenantId: string,
    id: string,
    updateQuoteDto: UpdateQuoteDto,
  ): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);

    // Prevent update if quote is already converted or expired
    if (quote.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot update a converted quote');
    }

    // If calculation-related fields are updated, recalculate
    let calculationDetails = quote.calculationDetails;
    let monthlyPayment = quote.monthlyPayment;
    let totalAmount = quote.totalAmount;

    if (
      updateQuoteDto.assetValue !== undefined ||
      updateQuoteDto.downPayment !== undefined ||
      updateQuoteDto.interestRate !== undefined ||
      updateQuoteDto.durationMonths !== undefined
    ) {
      const calculation = this.calculationService.calculate({
        assetValue: updateQuoteDto.assetValue ?? Number(quote.assetValue),
        downPayment: updateQuoteDto.downPayment ?? Number(quote.downPayment),
        interestRate: updateQuoteDto.interestRate ?? Number(quote.interestRate),
        durationMonths: updateQuoteDto.durationMonths ?? quote.durationMonths,
        leaseType: updateQuoteDto.leaseType ?? quote.leaseType,
      });

      calculationDetails = calculation;
      monthlyPayment = calculation.monthlyPayment;
      totalAmount = calculation.totalAmount;
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...updateQuoteDto,
        calculationDetails,
        monthlyPayment,
        totalAmount,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const quote = await this.findOne(tenantId, id);

    if (quote.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete a converted quote');
    }

    await this.prisma.quote.delete({ where: { id } });
  }

  async calculate(calculateQuoteDto: CalculateQuoteDto): Promise<any> {
    return this.calculationService.calculate({
      assetValue: calculateQuoteDto.assetValue,
      downPayment: calculateQuoteDto.downPayment,
      interestRate: calculateQuoteDto.interestRate,
      durationMonths: calculateQuoteDto.durationMonths,
      leaseType: calculateQuoteDto.leaseType,
    });
  }

  async approve(
    tenantId: string,
    id: string,
    userId: string,
    approveQuoteDto: ApproveQuoteDto,
  ): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);

    if (quote.status === QuoteStatus.APPROVED) {
      throw new BadRequestException('Quote is already approved');
    }

    if (quote.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot approve a converted quote');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.APPROVED,
        approvedBy: userId,
        approvedAt: new Date(),
        notes: approveQuoteDto.notes
          ? `${quote.notes || ''}\nApproval notes: ${approveQuoteDto.notes}`
          : quote.notes,
      },
    });
  }

  async reject(tenantId: string, id: string, userId: string): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);

    if (quote.status === QuoteStatus.CONVERTED) {
      throw new BadRequestException('Cannot reject a converted quote');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.REJECTED,
      },
    });
  }

  async findByCustomer(
    tenantId: string,
    customerId: string,
  ): Promise<Quote[]> {
    return this.prisma.quote.findMany({
      where: { tenantId, customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByStatus(
    tenantId: string,
    status: QuoteStatus,
  ): Promise<Quote[]> {
    return this.prisma.quote.findMany({
      where: { tenantId, status },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
