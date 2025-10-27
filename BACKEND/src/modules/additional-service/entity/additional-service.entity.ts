import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('additional-services')
export class AdditionalService extends BaseModel {
  @Column()
  name: string;
}
