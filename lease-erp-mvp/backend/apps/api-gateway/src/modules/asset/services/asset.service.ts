import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  CreateAssetDto,
  UpdateAssetDto,
  UploadAssetImagesDto,
} from '../dto/asset.dto';
import { PaginationDto } from '@app/common/dto';
import { PaginatedResponse } from '@app/common/interfaces';
import { Asset, AssetType, AssetStatus } from '@prisma/client';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  private async generateAssetNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.asset.count({
      where: {
        tenantId,
        assetNumber: {
          startsWith: `AST-${year}`,
        },
      },
    });

    return `AST-${year}-${String(count + 1).padStart(5, '0')}`;
  }

  async create(
    tenantId: string,
    createAssetDto: CreateAssetDto,
  ): Promise<Asset> {
    const assetNumber = await this.generateAssetNumber(tenantId);

    return this.prisma.asset.create({
      data: {
        tenantId,
        assetNumber,
        type: createAssetDto.type,
        category: createAssetDto.category,
        make: createAssetDto.make,
        model: createAssetDto.model,
        year: createAssetDto.year,
        serialNumber: createAssetDto.serialNumber,
        vin: createAssetDto.vin,
        purchaseDate: createAssetDto.purchaseDate
          ? new Date(createAssetDto.purchaseDate)
          : null,
        purchaseValue: createAssetDto.purchaseValue,
        currentValue: createAssetDto.currentValue || createAssetDto.purchaseValue,
        location: createAssetDto.location,
        specifications: createAssetDto.specifications,
        metadata: createAssetDto.metadata,
        status: AssetStatus.AVAILABLE,
        images: [],
      },
    });
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<Asset>> {
    const { page, limit, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          contractAssets: {
            where: { returnedAt: null },
            include: {
              contract: {
                select: {
                  id: true,
                  contractNumber: true,
                  status: true,
                  customer: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.asset.count({ where: { tenantId } }),
    ]);

    return {
      data: assets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string): Promise<Asset> {
    const asset = await this.prisma.asset.findFirst({
      where: { id, tenantId },
      include: {
        contractAssets: {
          include: {
            contract: {
              include: {
                customer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(
    tenantId: string,
    id: string,
    updateAssetDto: UpdateAssetDto,
  ): Promise<Asset> {
    await this.findOne(tenantId, id);

    return this.prisma.asset.update({
      where: { id },
      data: {
        ...updateAssetDto,
        purchaseDate: updateAssetDto.purchaseDate
          ? new Date(updateAssetDto.purchaseDate)
          : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const asset = await this.findOne(tenantId, id);

    if (asset.status === AssetStatus.LEASED) {
      throw new BadRequestException(
        'Cannot delete an asset that is currently leased',
      );
    }

    await this.prisma.asset.delete({ where: { id } });
  }

  async uploadImages(
    tenantId: string,
    id: string,
    uploadImagesDto: UploadAssetImagesDto,
  ): Promise<Asset> {
    const asset = await this.findOne(tenantId, id);

    // Append new images to existing ones
    const updatedImages = [...asset.images, ...uploadImagesDto.imageUrls];

    return this.prisma.asset.update({
      where: { id },
      data: {
        images: updatedImages,
      },
    });
  }

  async removeImage(
    tenantId: string,
    id: string,
    imageUrl: string,
  ): Promise<Asset> {
    const asset = await this.findOne(tenantId, id);

    const updatedImages = asset.images.filter((url) => url !== imageUrl);

    return this.prisma.asset.update({
      where: { id },
      data: {
        images: updatedImages,
      },
    });
  }

  async findAvailable(tenantId: string): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      where: {
        tenantId,
        status: AssetStatus.AVAILABLE,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByType(tenantId: string, type: AssetType): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      where: {
        tenantId,
        type,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(
    tenantId: string,
    status: AssetStatus,
  ): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      where: {
        tenantId,
        status,
      },
      include: {
        contractAssets: {
          where: { returnedAt: null },
          include: {
            contract: {
              select: {
                id: true,
                contractNumber: true,
                customer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAssetHistory(tenantId: string, id: string): Promise<any> {
    const asset = await this.findOne(tenantId, id);

    const history = await this.prisma.contractAsset.findMany({
      where: { assetId: id },
      include: {
        contract: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return {
      asset,
      history,
    };
  }
}
