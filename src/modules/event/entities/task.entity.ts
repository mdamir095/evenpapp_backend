import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, ObjectId } from 'typeorm';
import { Event } from './event.entity';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('tasks')
export class Task extends BaseModel{

  constructor() {
    super();
  }

  @Column()
  event: string;

  @Column()
  assignedTo: string;

  @Column({ default: 'pending' })
  status: string; // pending, in-progress, completed

  @Column()
  dueDate: Date;

  @Column()
  priority: string; // high, medium, low

  @Column()
  notes: string;

}
