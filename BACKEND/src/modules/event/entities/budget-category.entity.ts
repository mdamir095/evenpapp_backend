import { Entity, Column, CreateDateColumn, UpdateDateColumn, ObjectId } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('budget_categories')
export class BudgetCategory extends BaseModel {

  constructor() {
    super();
  }

  @Column()
  event: string;

  @Column()
  name: string;

  @Column()
  allocatedAmount: number;

  @Column()
  actualSpent: number;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isActive: boolean;

}
