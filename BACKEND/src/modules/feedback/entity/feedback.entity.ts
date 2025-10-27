import { BaseModel } from '@shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('feedbacks')
export class Feedback extends BaseModel {
  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  feedback: string;

  @Column({ nullable: true })
  rating?: number;

  @Column({ nullable: true })
  type?: string;

}

