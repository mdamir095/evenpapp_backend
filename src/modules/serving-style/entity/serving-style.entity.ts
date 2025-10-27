import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('serving-styles')
export class ServingStyle extends BaseModel {
  @Column()
  name: string;
}


