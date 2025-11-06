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
import { AssetService } from '../services/asset.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  UploadAssetImagesDto,
} from '../dto/asset.dto';
import { PaginationDto } from '@app/common/dto';
import { JwtAuthGuard, TenantGuard } from '@app/auth/guards';
import { TenantId } from '@app/common/decorators';
import { AssetType, AssetStatus } from '@prisma/client';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  create(
    @TenantId() tenantId: string,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    return this.assetService.create(tenantId, createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets with pagination' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.assetService.findAll(tenantId, paginationDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available assets' })
  findAvailable(@TenantId() tenantId: string) {
    return this.assetService.findAvailable(tenantId);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get assets by type' })
  @ApiQuery({ name: 'type', enum: AssetType })
  findByType(@TenantId() tenantId: string, @Param('type') type: AssetType) {
    return this.assetService.findByType(tenantId, type);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get assets by status' })
  @ApiQuery({ name: 'status', enum: AssetStatus })
  findByStatus(
    @TenantId() tenantId: string,
    @Param('status') status: AssetStatus,
  ) {
    return this.assetService.findByStatus(tenantId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.assetService.findOne(tenantId, id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get asset lease history' })
  getHistory(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.assetService.getAssetHistory(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetService.update(tenantId, id, updateAssetDto);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload asset images' })
  uploadImages(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() uploadImagesDto: UploadAssetImagesDto,
  ) {
    return this.assetService.uploadImages(tenantId, id, uploadImagesDto);
  }

  @Delete(':id/images')
  @ApiOperation({ summary: 'Remove an asset image' })
  removeImage(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body('imageUrl') imageUrl: string,
  ) {
    return this.assetService.removeImage(tenantId, id, imageUrl);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.assetService.remove(tenantId, id);
  }
}
