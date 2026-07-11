import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class EstimateItemDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
}

export class CreateEstimateDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  estimateNumber?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateItemDto)
  items: EstimateItemDto[];

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsIn(['standard', 'simple', 'detailed', 'modern'])
  layout?: 'standard' | 'simple' | 'detailed' | 'modern';

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  stampUrl?: string;
}

export class UpdateEstimateDto extends CreateEstimateDto {}
