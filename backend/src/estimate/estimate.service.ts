import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { Estimate, EstimateItem } from './estimate.model';

// サンプルデータ
const SAMPLE_ESTIMATES = [
  {
    id: 1,
    title: 'A様邸 増築工事',
    items: [
      { id: 1, name: '鉄骨工事', quantity: 5, price: 150000 },
      { id: 2, name: 'コンクリート打設', quantity: 20, price: 18000 },
      { id: 3, name: '内装仕上げ', quantity: 50, price: 12000 },
    ],
  },
  {
    id: 2,
    title: 'B様邸 リフォーム工事',
    items: [
      { id: 4, name: '外壁塗装', quantity: 100, price: 4500 },
      { id: 5, name: '屋根工事', quantity: 60, price: 8000 },
    ],
  },
];

@Injectable()
export class EstimateService {
  private readonly estimates: Estimate[] = [];
  private nextEstimateId = 1;
  private nextEstimateItemId = 1;

  constructor() {
    // 起動時にサンプルデータをロード
    this.loadSampleData();
  }

  private loadSampleData(): void {
    SAMPLE_ESTIMATES.forEach((sample) => {
      const estimate: Estimate = {
        id: this.nextEstimateId++,
        title: sample.title,
        items: sample.items.map((item) => ({
          id: this.nextEstimateItemId++,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      this.estimates.push(estimate);
    });
  }

  create(createEstimateDto: CreateEstimateDto): Estimate {
    const items: EstimateItem[] = createEstimateDto.items.map((item) => ({
      id: this.nextEstimateItemId++,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const estimate: Estimate = {
      id: this.nextEstimateId++,
      title: createEstimateDto.title,
      items,
    };

    this.estimates.push(estimate);
    return estimate;
  }

  findAll(): Estimate[] {
    return this.estimates;
  }

  findOne(id: number): Estimate {
    const estimate = this.estimates.find((value) => value.id === id);

    if (!estimate) {
      throw new NotFoundException(`Estimate with id ${id} not found`);
    }

    return estimate;
  }
}
