import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../entities/company.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { EstimateEntity } from '../entities/estimate.entity';
import { EstimateItemEntity } from '../entities/estimate-item.entity';
import { ItemMasterEntity } from '../entities/item-master.entity';
import { UserEntity } from '../entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      UserEntity,
      CustomerEntity,
      ItemMasterEntity,
      EstimateEntity,
      EstimateItemEntity,
    ]),
  ],
  providers: [SeedService],
})
export class DatabaseModule {}
