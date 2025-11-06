import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateContractDto,
  UpdateContractDto,
  AssignAssetsDto,
  SignContractDto,
} from '../dto/contract.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Contract, ContractStatus, AssetStatus } from '@prisma/client';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  private async generateContractNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.contract.count({
      where: {
        tenantId,
        contractNumber: {
          startsWith: `CT-${year}`,
        },
      },
    });

    return `CT-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(
    tenantId: string,
    userId: string,
    createContractDto: CreateContractDto,
  ): Promise<Contract> {
    // Verify customer exists
    const customer = await this.prisma.customer.findFirst({
      where: { id: createContractDto.customerId, tenantId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // If quoteId is provided, verify it and update quote status
    if (createContractDto.quoteId) {
      const quote = await this.prisma.quote.findFirst({
        where: { id: createContractDto.quoteId, tenantId },
      });

      if (!quote) {
        throw new NotFoundException('Quote not found');
      }

      // Update quote to converted status
      await this.prisma.quote.update({
        where: { id: createContractDto.quoteId },
        data: { status: 'CONVERTED' },
      });
    }

    // If parentContractId is provided, verify it exists
    if (createContractDto.parentContractId) {
      const parentContract = await this.prisma.contract.findFirst({
        where: { id: createContractDto.parentContractId, tenantId },
      });

      if (!parentContract) {
        throw new NotFoundException('Parent contract not found');
      }
    }

    // Generate contract number
    const contractNumber = await this.generateContractNumber(tenantId);

    // Create contract
    const contract = await this.prisma.contract.create({
      data: {
        tenantId,
        contractNumber,
        quoteId: createContractDto.quoteId,
        customerId: createContractDto.customerId,
        leaseType: createContractDto.leaseType,
        startDate: new Date(createContractDto.startDate),
        endDate: new Date(createContractDto.endDate),
        terms: createContractDto.terms,
        totalValue: createContractDto.totalValue,
        monthlyPayment: createContractDto.monthlyPayment,
        notes: createContractDto.notes,
        parentContractId: createContractDto.parentContractId,
        createdBy: userId,
        status: ContractStatus.DRAFT,
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
        quote: {
          select: {
            id: true,
            quoteNumber: true,
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

    // Assign assets if provided
    if (createContractDto.assetIds && createContractDto.assetIds.length > 0) {
      await this.assignAssets(tenantId, contract.id, {
        assetIds: createContractDto.assetIds,
      });
    }

    return contract;
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Contract>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
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
          contractAssets: {
            include: {
              asset: {
                select: {
                  id: true,
                  assetNumber: true,
                  type: true,
                  make: true,
                  model: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.contract.count({ where: { tenantId } }),
    ]);

    return {
      data: contracts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Contract> {
    const contract = await this.prisma.contract.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        quote: true,
        parentContract: {
          select: {
            id: true,
            contractNumber: true,
            status: true,
          },
        },
        subContracts: {
          select: {
            id: true,
            contractNumber: true,
            status: true,
            createdAt: true,
          },
        },
        contractAssets: {
          include: {
            asset: true,
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

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(
    tenantId: string,
    id: string,
    updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    await this.findOne(tenantId, id);

    return this.prisma.contract.update({
      where: { id },
      data: {
        ...updateContractDto,
        startDate: updateContractDto.startDate
          ? new Date(updateContractDto.startDate)
          : undefined,
        endDate: updateContractDto.endDate
          ? new Date(updateContractDto.endDate)
          : undefined,
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
    const contract = await this.findOne(tenantId, id);

    if (contract.status === ContractStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active contract. Terminate it first.');
    }

    await this.prisma.contract.delete({ where: { id } });
  }

  async activate(tenantId: string, id: string): Promise<Contract> {
    const contract = await this.findOne(tenantId, id);

    if (contract.status === ContractStatus.ACTIVE) {
      throw new BadRequestException('Contract is already active');
    }

    if (contract.status === ContractStatus.TERMINATED || contract.status === ContractStatus.COMPLETED) {
      throw new BadRequestException('Cannot activate a terminated or completed contract');
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.ACTIVE,
      },
    });
  }

  async suspend(tenantId: string, id: string, reason?: string): Promise<Contract> {
    const contract = await this.findOne(tenantId, id);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException('Only active contracts can be suspended');
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.SUSPENDED,
        notes: reason ? `${contract.notes || ''}\nSuspension reason: ${reason}` : contract.notes,
      },
    });
  }

  async terminate(tenantId: string, id: string, reason?: string): Promise<Contract> {
    const contract = await this.findOne(tenantId, id);

    if (contract.status === ContractStatus.TERMINATED) {
      throw new BadRequestException('Contract is already terminated');
    }

    // Release all assets assigned to this contract
    const contractAssets = await this.prisma.contractAsset.findMany({
      where: { contractId: id, returnedAt: null },
    });

    for (const ca of contractAssets) {
      await this.prisma.contractAsset.update({
        where: { id: ca.id },
        data: { returnedAt: new Date() },
      });

      await this.prisma.asset.update({
        where: { id: ca.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.TERMINATED,
        notes: reason ? `${contract.notes || ''}\nTermination reason: ${reason}` : contract.notes,
      },
    });
  }

  async assignAssets(
    tenantId: string,
    id: string,
    assignAssetsDto: AssignAssetsDto,
  ): Promise<Contract> {
    const contract = await this.findOne(tenantId, id);

    // Verify all assets exist and are available
    for (const assetId of assignAssetsDto.assetIds) {
      const asset = await this.prisma.asset.findFirst({
        where: { id: assetId, tenantId },
      });

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${assetId} not found`);
      }

      if (asset.status !== AssetStatus.AVAILABLE) {
        throw new BadRequestException(`Asset ${asset.assetNumber} is not available`);
      }
    }

    // Assign assets and update their status
    for (const assetId of assignAssetsDto.assetIds) {
      await this.prisma.contractAsset.create({
        data: {
          contractId: id,
          assetId,
        },
      });

      await this.prisma.asset.update({
        where: { id: assetId },
        data: { status: AssetStatus.LEASED },
      });
    }

    return this.findOne(tenantId, id);
  }

  async signContract(
    tenantId: string,
    id: string,
    signContractDto: SignContractDto,
  ): Promise<Contract> {
    const contract = await this.findOne(tenantId, id);

    if (contract.signedAt) {
      throw new BadRequestException('Contract is already signed');
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        signedDocumentUrl: signContractDto.signedDocumentUrl,
        signedAt: signContractDto.signedAt
          ? new Date(signContractDto.signedAt)
          : new Date(),
      },
    });
  }

  async findByCustomer(
    tenantId: string,
    customerId: string,
  ): Promise<Contract[]> {
    return this.prisma.contract.findMany({
      where: { tenantId, customerId },
      include: {
        contractAssets: {
          include: {
            asset: {
              select: {
                id: true,
                assetNumber: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(
    tenantId: string,
    status: ContractStatus,
  ): Promise<Contract[]> {
    return this.prisma.contract.findMany({
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
