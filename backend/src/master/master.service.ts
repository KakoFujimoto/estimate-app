import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      const entities = customers.map((c) =>
        manager.create(CustomerEntity, { ...c, companyId }),
      );
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
}
