import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EstimateEntity } from './estimate.entity';

@Entity('estimate_items')
export class EstimateItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  estimateId: number;

  @Column()
  name: string;

  @Column({ type: 'real' })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'integer' })
  unitPrice: number;

  @Column({ type: 'integer' })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'real', default: 10 })
  taxRate: number;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @ManyToOne(() => EstimateEntity, (estimate) => estimate.items, {
    onDelete: 'CASCADE',
  })
  estimate: EstimateEntity;
}
