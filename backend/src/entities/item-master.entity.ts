import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyEntity } from './company.entity';

@Entity('item_masters')
export class ItemMasterEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  unit: string;

  @Column({ type: 'integer' })
  defaultUnitPrice: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @ManyToOne(() => CompanyEntity, (company) => company.items)
  company: CompanyEntity;
}
