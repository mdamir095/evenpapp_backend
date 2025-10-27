import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('categories')
export class ServiceCategory extends BaseModel{

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  description?: string;

  @Column({ nullable: true, default: null })
  formId?: string;

  @Column({ default: true })
  isActive: boolean;
}
