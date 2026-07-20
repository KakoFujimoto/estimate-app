import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddressFieldsDto {
  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  prefecture?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;
}

export class UpdateCompanyDto extends AddressFieldsDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

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

export class CreateCustomerDto extends AddressFieldsDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

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
