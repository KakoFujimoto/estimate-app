import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import { EstimateEntity } from './estimate.entity';
import { ItemMasterEntity } from './item-master.entity';
import { UserEntity } from './user.entity';

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  postalCode: string;

  @Column({ default: '' })
  prefecture: string;

  @Column({ default: '' })
  city: string;

  @Column({ default: '' })
  town: string;

  @Column({ default: '' })
  streetAddress: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  representative: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  stampUrl: string | null;

  @OneToMany(() => UserEntity, (user) => user.company)
  users: UserEntity[];

  @OneToMany(() => CustomerEntity, (customer) => customer.company)
  customers: CustomerEntity[];

  @OneToMany(() => ItemMasterEntity, (item) => item.company)
  items: ItemMasterEntity[];

  @OneToMany(() => EstimateEntity, (estimate) => estimate.company)
  estimates: EstimateEntity[];
}
