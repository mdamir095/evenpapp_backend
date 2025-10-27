import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, ObjectId } from 'typeorm';
import { Event } from './event.entity';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('guests')
export class Guest extends BaseModel {

  constructor() {
    super();
  }

  @Column()
  event: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ default: false })
  isConfirmed: boolean;

}
