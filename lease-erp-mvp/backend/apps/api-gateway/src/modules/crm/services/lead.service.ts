import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreateLeadDto, UpdateLeadDto } from '../dto/lead.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Lead } from '@prisma/client';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    createLeadDto: CreateLeadDto,
  ): Promise<Lead> {
    return this.prisma.lead.create({
      data: {
        ...createLeadDto,
        tenantId,
      },
      include: {
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
  ): Promise<PaginatedResponse<Lead>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.lead.count({ where: { tenantId } }),
    ]);

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Lead> {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        opportunity: true,
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async update(
    tenantId: string,
    id: string,
    updateLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    await this.findOne(tenantId, id);

    return this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
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
    await this.prisma.lead.delete({ where: { id } });
  }

  async convertToCustomer(tenantId: string, leadId: string): Promise<any> {
    const lead = await this.findOne(tenantId, leadId);

    // Create customer from lead
    const customer = await this.prisma.customer.create({
      data: {
        tenantId,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        type: lead.company ? 'BUSINESS' : 'INDIVIDUAL',
      },
    });

    // Create opportunity
    const opportunity = await this.prisma.opportunity.create({
      data: {
        tenantId,
        customerId: customer.id,
        leadId: lead.id,
        title: `Opportunity from ${lead.name}`,
        value: 0,
        assignedTo: lead.assignedTo,
      },
    });

    // Update lead status
    await this.update(tenantId, leadId, { status: 'CONVERTED' });

    return { customer, opportunity };
  }
}
