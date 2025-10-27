import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity({ name:'testimonials'})
export class Testimonial extends BaseModel {
  @Column()
  name: string;

  @Column({ nullable: true })
  designation?: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column()
  rating: number
}

