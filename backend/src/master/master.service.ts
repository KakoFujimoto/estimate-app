import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  applyFormattedAddress,
  normalizePostalCode,
} from '../common/utils/address.util';
import { CompanyEntity } from '../entities/company.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { ItemMasterEntity } from '../entities/item-master.entity';
import {
  CreateCustomerDto,
  CreateItemMasterDto,
  UpdateCompanyDto,
  UpdateCustomerDto,
  UpdateItemMasterDto,
} from './dto/master.dto';
import type { PostalCodeSearchResult } from './dto/postal-code.dto';

@Injectable()
export class MasterService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(ItemMasterEntity)
    private readonly itemRepo: Repository<ItemMasterEntity>,
  ) {}

  async getCompany(companyId: number): Promise<CompanyEntity> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async updateCompany(
    companyId: number,
    dto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    const company = await this.getCompany(companyId);
    Object.assign(company, dto);
    applyFormattedAddress(company);
    return this.companyRepo.save(company);
  }

  findCustomers(companyId: number): Promise<CustomerEntity[]> {
    return this.customerRepo.find({ where: { companyId }, order: { id: 'ASC' } });
  }

  async createCustomer(
    companyId: number,
    dto: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    const customer = this.customerRepo.create({ ...dto, companyId });
    applyFormattedAddress(customer);
    return this.customerRepo.save(customer);
  }

  async updateCustomer(
    id: number,
    companyId: number,
    dto: UpdateCustomerDto,
  ): Promise<CustomerEntity> {
    const customer = await this.customerRepo.findOne({ where: { id, companyId } });
    if (!customer) throw new NotFoundException('Customer not found');
    Object.assign(customer, dto);
    applyFormattedAddress(customer);
    return this.customerRepo.save(customer);
  }

  async removeCustomer(id: number, companyId: number): Promise<void> {
    const customer = await this.customerRepo.findOne({ where: { id, companyId } });
    if (!customer) throw new NotFoundException('Customer not found');
    await this.customerRepo.remove(customer);
  }

  replaceCustomers(
    companyId: number,
    customers: UpdateCustomerDto[],
  ): Promise<CustomerEntity[]> {
    return this.customerRepo.manager.transaction(async (manager) => {
      await manager.delete(CustomerEntity, { companyId });
      const entities = customers.map((c) => {
        const entity = manager.create(CustomerEntity, { ...c, companyId });
        applyFormattedAddress(entity);
        return entity;
      });
      return manager.save(entities);
    });
  }

  findItems(companyId: number): Promise<ItemMasterEntity[]> {
    return this.itemRepo.find({ where: { companyId }, order: { id: 'ASC' } });
  }

  async createItem(
    companyId: number,
    dto: CreateItemMasterDto,
  ): Promise<ItemMasterEntity> {
    const item = this.itemRepo.create({ ...dto, companyId });
    return this.itemRepo.save(item);
  }

  async updateItem(
    id: number,
    companyId: number,
    dto: UpdateItemMasterDto,
  ): Promise<ItemMasterEntity> {
    const item = await this.itemRepo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException('Item not found');
    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async removeItem(id: number, companyId: number): Promise<void> {
    const item = await this.itemRepo.findOne({ where: { id, companyId } });
    if (!item) throw new NotFoundException('Item not found');
    await this.itemRepo.remove(item);
  }

  replaceItems(
    companyId: number,
    items: UpdateItemMasterDto[],
  ): Promise<ItemMasterEntity[]> {
    return this.itemRepo.manager.transaction(async (manager) => {
      await manager.delete(ItemMasterEntity, { companyId });
      const entities = items.map((i) =>
        manager.create(ItemMasterEntity, { ...i, companyId }),
      );
      return manager.save(entities);
    });
  }

  async searchPostalCode(zipcode: string): Promise<PostalCodeSearchResult[]> {
    const digits = normalizePostalCode(zipcode);
    if (digits.length !== 7) {
      throw new BadRequestException('郵便番号は7桁で入力してください');
    }

    const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new BadRequestException('郵便番号の検索に失敗しました');
    }

    const data = (await response.json()) as {
      status: number;
      message: string | null;
      results: Array<{
        zipcode: string;
        address1: string;
        address2: string;
        address3: string;
      }> | null;
    };

    if (data.status !== 200 || !data.results?.length) {
      throw new BadRequestException(
        data.message ?? '該当する郵便番号が見つかりませんでした',
      );
    }

    return data.results.map((row) => ({
      postalCode: row.zipcode,
      prefecture: row.address1,
      city: row.address2,
      town: row.address3,
    }));
  }
}
