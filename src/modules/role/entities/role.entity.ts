import { Entity, Column, ObjectId } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';
import { Feature } from '@modules/feature/entities/feature.entity';
@Entity('roles')
export class Role extends BaseModel {
  constructor() {
    super();        
  }

  @Column({ unique: true })
  name: string;

  @Column()
  isInternal: boolean;

  @Column()
  featureIds: ObjectId[];

}
