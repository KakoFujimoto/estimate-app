import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEstimateDto } from './dto/create-estimate.dto';
import { Estimate, EstimateItem } from './estimate.model';

@Injectable()
export class EstimateService {
  private readonly estimates: Estimate[] = [];
  private nextEstimateId = 1;
  private nextEstimateItemId = 1;

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
