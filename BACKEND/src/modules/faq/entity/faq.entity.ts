import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('faqs')
export class Faq extends BaseModel {
  @Column()
  question: string;

  @Column()
  answer: string;

  @Column({ default: false })
  isExpanded: boolean;
}