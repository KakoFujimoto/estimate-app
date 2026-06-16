import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimateEntity } from '../entities/estimate.entity';
import { EstimateItemEntity } from '../entities/estimate-item.entity';
import { EstimateController } from './estimate.controller';
import { EstimateService } from './estimate.service';

@Module({
  imports: [TypeOrmModule.forFeature([EstimateEntity, EstimateItemEntity])],
  controllers: [EstimateController],
  providers: [EstimateService],
})
export class EstimateModule {}
