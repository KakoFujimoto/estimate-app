import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyEntity } from './company.entity';
import { EstimateItemEntity } from './estimate-item.entity';

export type LayoutType = 'standard' | 'simple' | 'detailed' | 'modern';

@Entity('estimates')
export class EstimateEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

  @Column()
  title: string;

  @Column()
  estimateNumber: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  customerName: string;

  @Column({ type: 'text', nullable: true })
  customerAddress: string | null;

  @Column({ type: 'text', nullable: true })
  customerPhone: string | null;

  @Column({ type: 'integer' })
  subtotal: number;

  @Column({ type: 'real', default: 10 })
  taxRate: number;

  @Column({ type: 'integer' })
  tax: number;

  @Column({ type: 'integer' })
  total: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ default: 'standard' })
  layout: LayoutType;

  @Column({ type: 'text', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  stampUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EstimateItemEntity, (item) => item.estimate, {
    cascade: true,
    eager: true,
  })
  items: EstimateItemEntity[];

  @ManyToOne(() => CompanyEntity, (company) => company.estimates)
  company: CompanyEntity;
}
