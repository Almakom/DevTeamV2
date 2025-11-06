import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  IsDateString,
  IsObject,
} from 'class-validator';
import { AssetType, LeaseType, QuoteStatus } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiPropertyOptional({ example: 'opp-id-here' })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiProperty({ example: 'cust-id-here' })
  @IsString()
  customerId: string;

  @ApiProperty({ enum: AssetType, example: AssetType.VEHICLE })
  @IsEnum(AssetType)
  assetType: AssetType;

  @ApiProperty({ example: 'Toyota Camry 2024, 4-door sedan, white' })
  @IsString()
  assetDescription: string;

  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0)
  assetValue: number;

  @ApiProperty({ enum: LeaseType, example: LeaseType.FINANCIAL_LEASE })
  @IsEnum(LeaseType)
  leaseType: LeaseType;

  @ApiProperty({ example: 36 })
  @IsInt()
  @Min(1)
  durationMonths: number;

  @ApiPropertyOptional({ example: 7000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @ApiProperty({ example: 0.055, description: 'Interest rate as decimal (e.g., 5.5% = 0.055)' })
  @IsNumber()
  @Min(0)
  interestRate: number;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ example: 'Special conditions or notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateQuoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ enum: AssetType })
  @IsOptional()
  @IsEnum(AssetType)
  assetType?: AssetType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assetDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  assetValue?: number;

  @ApiPropertyOptional({ enum: LeaseType })
  @IsOptional()
  @IsEnum(LeaseType)
  leaseType?: LeaseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  downPayment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @ApiPropertyOptional({ enum: QuoteStatus })
  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CalculateQuoteDto {
  @ApiProperty({ example: 35000 })
  @IsNumber()
  @Min(0)
  assetValue: number;

  @ApiProperty({ example: 7000 })
  @IsNumber()
  @Min(0)
  downPayment: number;

  @ApiProperty({ example: 0.055 })
  @IsNumber()
  @Min(0)
  interestRate: number;

  @ApiProperty({ example: 36 })
  @IsInt()
  @Min(1)
  durationMonths: number;

  @ApiProperty({ enum: LeaseType, example: LeaseType.FINANCIAL_LEASE })
  @IsEnum(LeaseType)
  leaseType: LeaseType;
}

export class ApproveQuoteDto {
  @ApiPropertyOptional({ example: 'Additional approval notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
