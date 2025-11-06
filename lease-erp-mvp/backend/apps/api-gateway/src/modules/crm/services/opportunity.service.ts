import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateOpportunityStageDto,
} from '../dto/opportunity.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Opportunity, OpportunityStage } from '@prisma/client';

@Injectable()
export class OpportunityService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    createOpportunityDto: CreateOpportunityDto,
  ): Promise<Opportunity> {
    // Verify customer exists and belongs to tenant
    const customer = await this.prisma.customer.findFirst({
      where: { id: createOpportunityDto.customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // If leadId is provided, verify it exists
    if (createOpportunityDto.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: createOpportunityDto.leadId, tenantId },
      });

      if (!lead) {
        throw new NotFoundException('Lead not found');
      }
    }

    return this.prisma.opportunity.create({
      data: {
        ...createOpportunityDto,
        tenantId,
        stage: createOpportunityDto.stage || OpportunityStage.PROSPECTING,
        probability: createOpportunityDto.probability || 0,
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
        assignedUser: {
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
  ): Promise<PaginatedResponse<Opportunity>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      this.prisma.opportunity.findMany({
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
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              name: true,
              source: true,
            },
          },
          quotes: {
            select: {
              id: true,
              quoteNumber: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.opportunity.count({ where: { tenantId } }),
    ]);

    return {
      data: opportunities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Opportunity> {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        lead: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        quotes: {
          include: {
            contract: {
              select: {
                id: true,
                contractNumber: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    return opportunity;
  }

  async update(
    tenantId: string,
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
  ): Promise<Opportunity> {
    await this.findOne(tenantId, id);

    return this.prisma.opportunity.update({
      where: { id },
      data: updateOpportunityDto,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedUser: {
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
    await this.findOne(tenantId, id);
    await this.prisma.opportunity.delete({ where: { id } });
  }

  async updateStage(
    tenantId: string,
    id: string,
    updateStageDto: UpdateOpportunityStageDto,
  ): Promise<Opportunity> {
    await this.findOne(tenantId, id);

    const updateData: any = {
      stage: updateStageDto.stage,
    };

    if (updateStageDto.probability !== undefined) {
      updateData.probability = updateStageDto.probability;
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: updateData,
    });
  }

  async markAsWon(tenantId: string, id: string): Promise<Opportunity> {
    const opportunity = await this.findOne(tenantId, id);

    if (opportunity.stage === OpportunityStage.CLOSED_WON) {
      throw new BadRequestException('Opportunity is already marked as won');
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        stage: OpportunityStage.CLOSED_WON,
        probability: 100,
      },
    });
  }

  async markAsLost(tenantId: string, id: string): Promise<Opportunity> {
    const opportunity = await this.findOne(tenantId, id);

    if (opportunity.stage === OpportunityStage.CLOSED_LOST) {
      throw new BadRequestException('Opportunity is already marked as lost');
    }

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        stage: OpportunityStage.CLOSED_LOST,
        probability: 0,
      },
    });
  }

  async getOpportunityPipeline(tenantId: string): Promise<any> {
    const opportunities = await this.prisma.opportunity.findMany({
      where: { tenantId },
      select: {
        stage: true,
        value: true,
      },
    });

    const pipeline = opportunities.reduce((acc, opp) => {
      if (!acc[opp.stage]) {
        acc[opp.stage] = {
          count: 0,
          totalValue: 0,
        };
      }
      acc[opp.stage].count++;
      acc[opp.stage].totalValue += Number(opp.value);
      return acc;
    }, {} as any);

    return pipeline;
  }

  async findByStage(
    tenantId: string,
    stage: OpportunityStage,
  ): Promise<Opportunity[]> {
    return this.prisma.opportunity.findMany({
      where: { tenantId, stage },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { value: 'desc' },
    });
  }
}
