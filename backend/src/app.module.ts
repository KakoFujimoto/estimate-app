import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CompanyEntity } from './entities/company.entity';
import { CustomerEntity } from './entities/customer.entity';
import { EstimateEntity } from './entities/estimate.entity';
import { EstimateItemEntity } from './entities/estimate-item.entity';
import { ItemMasterEntity } from './entities/item-master.entity';
import { UserEntity } from './entities/user.entity';
import { EstimateModule } from './estimate/estimate.module';
import { MasterModule } from './master/master.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: join(process.cwd(), 'data', 'estimate.db'),
      entities: [
        CompanyEntity,
        UserEntity,
        CustomerEntity,
        ItemMasterEntity,
        EstimateEntity,
        EstimateItemEntity,
      ],
      synchronize: true,
    }),
    DatabaseModule,
    AuthModule,
    EstimateModule,
    MasterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
