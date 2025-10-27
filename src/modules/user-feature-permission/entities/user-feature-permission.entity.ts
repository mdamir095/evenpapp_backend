
import { BaseModel } from '@shared/entities/base.entity';
import { Entity, Column, ObjectIdColumn, ObjectId, Index } from 'typeorm';

@Entity('user_feature_permissions')
export class UserFeaturePermission  extends BaseModel{

  constructor() {
    super();
  }

  @Column()
  roleId: string;

  @Column()
  featureId: string;

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  write: boolean;

  @Column({ default: false })
  admin: boolean;

}
