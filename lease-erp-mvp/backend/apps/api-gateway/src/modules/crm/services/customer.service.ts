import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  UpdateKycStatusDto,
} from '../dto/customer.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        tenantId,
      },
    });
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Customer>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          opportunities: {
            select: {
              id: true,
              title: true,
              stage: true,
              value: true,
            },
          },
          quotes: {
            select: {
              id: true,
              quoteNumber: true,
              status: true,
            },
          },
          contracts: {
            select: {
              id: true,
              contractNumber: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where: { tenantId } }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        opportunities: true,
        quotes: true,
        contracts: {
          include: {
            contractAssets: {
              include: {
                asset: true,
              },
            },
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(
    tenantId: string,
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    await this.findOne(tenantId, id);

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    await this.findOne(tenantId, id);
    await this.prisma.customer.delete({ where: { id } });
  }

  async updateKycStatus(
    tenantId: string,
    id: string,
    updateKycStatusDto: UpdateKycStatusDto,
  ): Promise<Customer> {
    await this.findOne(tenantId, id);

    return this.prisma.customer.update({
      where: { id },
      data: {
        kycStatus: updateKycStatusDto.kycStatus,
        kycDocuments: updateKycStatusDto.kycDocuments,
      },
    });
  }

  async searchByEmail(tenantId: string, email: string): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: {
        tenantId,
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
      take: 10,
    });
  }

  async getCustomerStats(tenantId: string, customerId: string): Promise<any> {
    const customer = await this.findOne(tenantId, customerId);

    const [totalOpportunities, wonOpportunities, activeContracts, totalValue] =
      await Promise.all([
        this.prisma.opportunity.count({
          where: { tenantId, customerId },
        }),
        this.prisma.opportunity.count({
          where: { tenantId, customerId, stage: 'CLOSED_WON' },
        }),
        this.prisma.contract.count({
          where: { tenantId, customerId, status: 'ACTIVE' },
        }),
        this.prisma.contract.aggregate({
          where: { tenantId, customerId, status: 'ACTIVE' },
          _sum: { totalValue: true },
        }),
      ]);

    return {
      customer,
      stats: {
        totalOpportunities,
        wonOpportunities,
        activeContracts,
        totalContractValue: totalValue._sum.totalValue || 0,
      },
    };
  }
}
