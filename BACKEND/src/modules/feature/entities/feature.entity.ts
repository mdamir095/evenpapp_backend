import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('features')
export class Feature extends BaseModel {
  constructor() {
    super();        
  }
  
 @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  uniqueId: string;

} 