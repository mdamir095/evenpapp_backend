import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

export enum AdminOfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('admin_offers')
export class AdminOffer extends BaseModel {
  @Column()
  bookingId: string;

  @Column()
  userId: string; // Admin/Enterprise user ID who submitted the offer

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  offerAmount: number;

  @Column({ type: 'simple-array', nullable: true })
  extraServices?: string[];

  @Column({
    type: 'enum',
    enum: AdminOfferStatus,
    default: AdminOfferStatus.PENDING,
  })
  status: AdminOfferStatus;

  @Column({ nullable: true })
  notes?: string;
}

