import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('service_category_form_inputs')
export class ServiceCategoryFormInput extends BaseModel {
  @Column()
  @Index()
  categoryId: string; // maps to ServiceCategory _id as string

  @Column()
  label: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  minrange?: number;

  @Column({ nullable: true })
  maxrange?: number;
}
