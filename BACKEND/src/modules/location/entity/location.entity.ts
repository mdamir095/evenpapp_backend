import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('locations')
export class Location extends BaseModel {

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  latitude?: number;

  @Column({ nullable: true })
  longitude?: number;

  @Column()
  serviceId: string;

  @Column({ default: true })
  isActive: boolean;
}

