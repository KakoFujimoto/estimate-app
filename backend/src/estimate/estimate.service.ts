import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  calcEstimateTotals,
  calcItemTotal,
} from '../common/utils/estimate-calculations';
import { EstimateEntity } from '../entities/estimate.entity';
import { EstimateItemEntity } from '../entities/estimate-item.entity';
import { CreateEstimateDto, UpdateEstimateDto } from './dto/estimate.dto';

@Injectable()
export class EstimateService {
  constructor(
    @InjectRepository(EstimateEntity)
    private readonly estimateRepo: Repository<EstimateEntity>,
  ) {}

  async findAll(companyId: number): Promise<EstimateEntity[]> {
    return this.estimateRepo.find({
      where: { companyId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number, companyId: number): Promise<EstimateEntity> {
    const estimate = await this.estimateRepo.findOne({
      where: { id, companyId },
    });
    if (!estimate) {
      throw new NotFoundException(`Estimate with id ${id} not found`);
    }
    return estimate;
  }

  async create(
    companyId: number,
    dto: CreateEstimateDto,
  ): Promise<EstimateEntity> {
    const count = await this.estimateRepo.count({ where: { companyId } });
    const year = new Date().getFullYear();
    const today = new Date().toISOString().slice(0, 10);

    const taxRate = dto.taxRate ?? 10;
    const items = this.buildItems(dto.items);
    const totals = calcEstimateTotals(items, taxRate);

    const estimate = this.estimateRepo.create({
      companyId,
      title: dto.title,
      estimateNumber:
        dto.estimateNumber ??
        `見積第${year}-${String(count + 1).padStart(3, '0')}号`,
      date: dto.date ?? today,
      customerName: dto.customerName ?? '',
      customerAddress: dto.customerAddress ?? null,
      customerPhone: dto.customerPhone ?? null,
      note: dto.note ?? null,
      layout: dto.layout ?? 'standard',
      logoUrl: dto.logoUrl ?? null,
      stampUrl: dto.stampUrl ?? null,
      taxRate,
      ...totals,
      items,
    });

    return this.estimateRepo.save(estimate);
  }

  async update(
    id: number,
    companyId: number,
    dto: UpdateEstimateDto,
  ): Promise<EstimateEntity> {
    const existing = await this.findOne(id, companyId);
    const taxRate = dto.taxRate ?? existing.taxRate;
    const items = this.buildItems(dto.items);
    const totals = calcEstimateTotals(items, taxRate);

    existing.title = dto.title;
    if (dto.estimateNumber) existing.estimateNumber = dto.estimateNumber;
    if (dto.date) existing.date = dto.date;
    existing.customerName = dto.customerName ?? '';
    existing.customerAddress = dto.customerAddress ?? null;
    existing.customerPhone = dto.customerPhone ?? null;
    existing.note = dto.note ?? null;
    existing.layout = dto.layout ?? existing.layout;
    existing.logoUrl = dto.logoUrl ?? null;
    existing.stampUrl = dto.stampUrl ?? null;
    existing.taxRate = taxRate;
    existing.subtotal = totals.subtotal;
    existing.tax = totals.tax;
    existing.total = totals.total;
    existing.items = items;

    return this.estimateRepo.save(existing);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const estimate = await this.findOne(id, companyId);
    await this.estimateRepo.remove(estimate);
  }

  async duplicate(id: number, companyId: number): Promise<EstimateEntity> {
    const source = await this.findOne(id, companyId);
    const count = await this.estimateRepo.count({ where: { companyId } });
    const year = new Date().getFullYear();

    const copy = this.estimateRepo.create({
      companyId,
      title: `${source.title}（コピー）`,
      estimateNumber: `見積第${year}-${String(count + 1).padStart(3, '0')}号`,
      date: new Date().toISOString().slice(0, 10),
      customerName: source.customerName,
      customerAddress: source.customerAddress,
      customerPhone: source.customerPhone,
      subtotal: source.subtotal,
      taxRate: source.taxRate,
      tax: source.tax,
      total: source.total,
      note: source.note,
      layout: source.layout,
      logoUrl: source.logoUrl,
      stampUrl: source.stampUrl,
      items: source.items.map((item, index) =>
        this.estimateRepo.manager.create(EstimateItemEntity, {
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          note: item.note,
          sortOrder: index,
        }),
      ),
    });

    return this.estimateRepo.save(copy);
  }

  private buildItems(
    items: CreateEstimateDto['items'],
  ): EstimateItemEntity[] {
    return items.map((item, index) =>
      this.estimateRepo.manager.create(EstimateItemEntity, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: calcItemTotal(item),
        note: item.note ?? null,
        sortOrder: index,
      }),
    );
  }
}
