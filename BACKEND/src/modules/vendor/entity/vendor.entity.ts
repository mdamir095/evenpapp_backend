import { Entity, Column, Index } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

@Entity('vendors')
export class Vendor extends BaseModel {
  @Column()
  @Index()
  categoryId: string;

  @Column()
  @Index()
  name: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  longDescription: string;

  @Column({ type: 'json' })
  formData: Record<string, any>;

  @Column()
  averageRating: number;

  @Column()
  totalRatings: number;

  @Column()
  price: number;

  @Column()
  imageUrl: string;

  @Column()
  review: string;

  @Column({ nullable: true })
  @Index()
  enterpriseId: string;

  @Column({ nullable: true })
  enterpriseName: string;

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
}
