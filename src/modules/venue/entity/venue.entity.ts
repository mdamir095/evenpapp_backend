import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('venues')
export class Venue extends BaseModel {
  @Column()
  @Index()
  categoryId: string;
  
  @Column({ unique: true })
  name: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  longDescription: string;

  @Column({ type: 'json' })
  formData: Record<string, any>;

  @Column({ default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalRatings: number;

  @Column()
  imageUrl: string;

  @Column()
  price: number;

  @Column({ type: 'json', nullable: true })
  albums: Array<{
    id: string;
    name: string;
    images: string[];
    imageCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  @Column({ nullable: true })
  @Index()
  enterpriseId: string;

  @Column({ nullable: true })
  enterpriseName: string;
}
