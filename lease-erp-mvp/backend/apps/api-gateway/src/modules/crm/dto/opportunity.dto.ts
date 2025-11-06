import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { OpportunityStage } from '@app/common/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'c1234567-89ab-cdef-0123-456789abcdef' })
  @IsString()
  customerId: string;

  @ApiPropertyOptional({ example: 'l1234567-89ab-cdef-0123-456789abcdef' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ example: 'Fleet Leasing Opportunity' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Customer needs 10 vehicles for 3 years' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  value: number;

  @ApiPropertyOptional({
    enum: OpportunityStage,
    example: OpportunityStage.PROSPECTING,
  })
  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @ApiPropertyOptional({ example: 50, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional({ example: 'user-id-here' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    example: { urgency: 'high', competitorInfo: 'Competitor A' },
  })
  @IsOptional()
  metadata?: any;
}

export class UpdateOpportunityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ enum: OpportunityStage })
  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: any;
}

export class UpdateOpportunityStageDto {
  @ApiProperty({ enum: OpportunityStage })
  @IsEnum(OpportunityStage)
  stage: OpportunityStage;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;
}
