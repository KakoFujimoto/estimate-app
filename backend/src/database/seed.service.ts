import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import {
  calcEstimateTotals,
  calcItemTotal,
} from '../common/utils/estimate-calculations';
import { CompanyEntity } from '../entities/company.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { EstimateEntity } from '../entities/estimate.entity';
import { EstimateItemEntity } from '../entities/estimate-item.entity';
import { ItemMasterEntity } from '../entities/item-master.entity';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(ItemMasterEntity)
    private readonly itemRepo: Repository<ItemMasterEntity>,
    @InjectRepository(EstimateEntity)
    private readonly estimateRepo: Repository<EstimateEntity>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) return;
    await this.seed();
  }

  private async seed() {
    const company = await this.companyRepo.save(
      this.companyRepo.create({
        name: 'サンプル建設株式会社',
        postalCode: '1000001',
        prefecture: '東京都',
        city: '千代田区',
        town: 'サンプル町',
        streetAddress: '1-2-3',
        address: '〒100-0001 東京都千代田区サンプル町1-2-3',
        phone: '03-1234-5678',
        email: 'info@sample-construction.jp',
        representative: '代表取締役 サンプル太郎',
      }),
    );

    await this.userRepo.save(
      this.userRepo.create({
        email: 'demo@sample-construction.jp',
        passwordHash: await bcrypt.hash('demo1234', 10),
        name: 'デモユーザー',
        companyId: company.id,
      }),
    );

    await this.customerRepo.save([
      this.customerRepo.create({
        companyId: company.id,
        name: 'サンプル商事株式会社',
        postalCode: '1000002',
        prefecture: '東京都',
        city: '千代田区',
        town: 'サンプル町',
        streetAddress: '2-3-4',
        address: '〒100-0002 東京都千代田区サンプル町2-3-4',
        phone: '03-2345-6789',
        email: 'purchase@sample-shoji.jp',
        contactPerson: 'サンプル様',
      }),
      this.customerRepo.create({
        companyId: company.id,
        name: '株式会社サンプル工務店',
        postalCode: '1000003',
        prefecture: '東京都',
        city: '千代田区',
        town: 'サンプル町',
        streetAddress: '3-4-5',
        address: '〒100-0003 東京都千代田区サンプル町3-4-5',
        phone: '03-3456-7890',
        email: 'info@sample-koumuten.jp',
        contactPerson: '工藤様',
      }),
    ]);

    await this.itemRepo.save([
      { companyId: company.id, name: '鉄骨工事', category: '構造', unit: 't', defaultUnitPrice: 150000, note: '鉄骨材工共' },
      { companyId: company.id, name: 'コンクリート打設', category: '構造', unit: 'm3', defaultUnitPrice: 18000, note: '型枠・鉄筋共' },
      { companyId: company.id, name: '内装仕上げ', category: '内装', unit: 'm2', defaultUnitPrice: 12000, note: 'クロス・床材共' },
      { companyId: company.id, name: '電気工事', category: '設備', unit: '式', defaultUnitPrice: 500000, note: '配線・器具共' },
      { companyId: company.id, name: '外壁塗装', category: '外装', unit: 'm2', defaultUnitPrice: 4500, note: '下地処理・塗装共' },
    ].map((item) => this.itemRepo.create(item)));

    const estimate1Items = [
      { name: '鉄骨工事', quantity: 5, unit: 't', unitPrice: 150000, note: '増築部分' },
      { name: 'コンクリート打設', quantity: 20, unit: 'm3', unitPrice: 18000, note: '基礎部分' },
      { name: '内装仕上げ', quantity: 50, unit: 'm2', unitPrice: 12000, note: '2階部分' },
    ];
    const totals1 = calcEstimateTotals(estimate1Items, 10);

    await this.estimateRepo.save(
      this.estimateRepo.create({
        companyId: company.id,
        title: 'A様邸 増築工事',
        estimateNumber: '見積第2024-001号',
        date: '2024-01-15',
        customerName: 'A様',
        customerAddress: '東京都sample区sample町1-1-1',
        customerPhone: '090-1234-5678',
        note: 'お見積もりありがとうございます。',
        layout: 'standard',
        taxRate: 10,
        ...totals1,
        items: estimate1Items.map((item, index) =>
          this.estimateRepo.manager.create(EstimateItemEntity, {
            ...item,
            taxRate: 10,
            totalPrice: calcItemTotal(item),
            sortOrder: index,
          }),
        ),
      }),
    );

    const estimate2Items = [
      { name: '外壁塗装', quantity: 100, unit: 'm2', unitPrice: 4500, note: '全面塗装' },
      { name: '屋根工事', quantity: 60, unit: 'm2', unitPrice: 8000, note: '葺き替え' },
    ];
    const totals2 = calcEstimateTotals(estimate2Items, 10);

    await this.estimateRepo.save(
      this.estimateRepo.create({
        companyId: company.id,
        title: 'B様邸 リフォーム工事',
        estimateNumber: '見積第2024-002号',
        date: '2024-01-20',
        customerName: 'B様',
        customerAddress: '東京都sample区sample町2-2-2',
        customerPhone: '090-2345-6789',
        layout: 'simple',
        taxRate: 10,
        ...totals2,
        items: estimate2Items.map((item, index) =>
          this.estimateRepo.manager.create(EstimateItemEntity, {
            ...item,
            taxRate: 10,
            totalPrice: calcItemTotal(item),
            sortOrder: index,
          }),
        ),
      }),
    );
  }
}
