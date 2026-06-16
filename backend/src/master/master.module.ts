import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../entities/company.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { ItemMasterEntity } from '../entities/item-master.entity';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, CustomerEntity, ItemMasterEntity]),
  ],
  controllers: [MasterController],
  providers: [MasterService],
  exports: [MasterService],
})
export class MasterModule {}
