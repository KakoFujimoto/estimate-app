import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  representative: string;

  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  stampUrl?: string | null;
}

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

export class CreateItemMasterDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(0)
  defaultUnitPrice: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateItemMasterDto extends CreateItemMasterDto {}
