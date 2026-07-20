import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';

@Entity('customers')
export class CustomerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

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

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  contactPerson: string | null;

  @ManyToOne(() => CompanyEntity, (company) => company.customers)
  company: CompanyEntity;
}
