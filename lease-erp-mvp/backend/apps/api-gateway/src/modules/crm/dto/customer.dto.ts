import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { CustomerType, KycStatus } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ enum: CustomerType, example: CustomerType.BUSINESS })
  @IsEnum(CustomerType)
  type: CustomerType;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contact@acme.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '12-3456789' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional({
    example: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
  })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiPropertyOptional({
    example: { industry: 'Technology', employees: 50 },
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional({ enum: CustomerType })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ example: 'Acme Corporation Updated' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'updated@acme.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '12-3456789' })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiPropertyOptional({ example: 750, minimum: 0, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  creditScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class UpdateKycStatusDto {
  @ApiProperty({ enum: KycStatus, example: KycStatus.APPROVED })
  @IsEnum(KycStatus)
  kycStatus: KycStatus;

  @ApiPropertyOptional({
    example: [
      { type: 'ID_CARD', url: 's3://...', uploadedAt: '2024-01-01' },
    ],
  })
  @IsOptional()
  kycDocuments?: any;
}
