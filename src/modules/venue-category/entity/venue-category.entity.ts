import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';
import { ObjectId } from 'mongodb';
@Entity('venue_categories')
export class VenueCategory extends BaseModel{

  @Column()
  name: string;

  @Column({ nullable: true, default: null })
  description?: string;
  
  @Column({ nullable: true, default: null })
  icon?: string;

  @Column({ nullable: true, default: '#000000' })
  color?: string;

  @Column()
  formId: string;

  @Column({ default: true })
  isActive: boolean;
}
