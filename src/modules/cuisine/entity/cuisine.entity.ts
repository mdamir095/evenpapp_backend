import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('cuisines')
export class Cuisine extends BaseModel {
  @Column()
  name: string;
}


