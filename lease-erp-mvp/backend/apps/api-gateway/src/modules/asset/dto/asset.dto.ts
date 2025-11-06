import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsArray,
  IsObject,
} from 'class-validator';
import { AssetType, AssetStatus } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ enum: AssetType, example: AssetType.VEHICLE })
  @IsEnum(AssetType)
  type: AssetType;

  @ApiProperty({ example: 'Car' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ example: 'Toyota' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: 'SN123456789' })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ example: '1HGCM82633A123456' })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 35000 })
  @IsOptional()
  @IsNumber()
  purchaseValue?: number;

  @ApiPropertyOptional({ example: 33000 })
  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @ApiPropertyOptional({ example: 'Warehouse A' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: { color: 'White', transmission: 'Automatic', mileage: 0 },
  })
  @IsOptional()
  @IsObject()
  specifications?: any;

  @ApiPropertyOptional({
    example: { notes: 'Brand new asset', warranty: '3 years' },
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateAssetDto {
  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  purchaseValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @ApiPropertyOptional({ enum: AssetStatus })
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  specifications?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UploadAssetImagesDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['https://s3.amazonaws.com/image1.jpg', 'https://s3.amazonaws.com/image2.jpg'],
  })
  @IsArray()
  imageUrls: string[];
}
