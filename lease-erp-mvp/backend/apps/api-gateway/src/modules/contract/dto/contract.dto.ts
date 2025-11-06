import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsObject,
  IsArray,
} from 'class-validator';
import { LeaseType, ContractStatus } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractDto {
  @ApiPropertyOptional({ example: 'quote-id-here' })
  @IsOptional()
  @IsString()
  quoteId?: string;

  @ApiProperty({ example: 'customer-id-here' })
  @IsString()
  customerId: string;

  @ApiProperty({ enum: LeaseType, example: LeaseType.FINANCIAL_LEASE })
  @IsEnum(LeaseType)
  leaseType: LeaseType;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: {
      paymentSchedule: [],
      termsAndConditions: 'Standard T&C',
      penalties: {},
    },
  })
  @IsObject()
  terms: any;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  totalValue: number;

  @ApiProperty({ example: 1388.89 })
  @IsNumber()
  monthlyPayment: number;

  @ApiPropertyOptional({ example: 'Contract notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'parent-contract-id-here' })
  @IsOptional()
  @IsString()
  parentContractId?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string' },
    example: ['asset-id-1', 'asset-id-2'],
  })
  @IsOptional()
  @IsArray()
  assetIds?: string[];
}

export class UpdateContractDto {
  @ApiPropertyOptional({ enum: LeaseType })
  @IsOptional()
  @IsEnum(LeaseType)
  leaseType?: LeaseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  terms?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyPayment?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignAssetsDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['asset-id-1', 'asset-id-2'],
  })
  @IsArray()
  assetIds: string[];
}

export class SignContractDto {
  @ApiProperty({ example: 'https://s3.amazonaws.com/signed-contract.pdf' })
  @IsString()
  signedDocumentUrl: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  signedAt?: string;
}
