import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('content_policies')
export class ContentPolicy extends BaseModel {
  
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  category: string;


  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;
}
