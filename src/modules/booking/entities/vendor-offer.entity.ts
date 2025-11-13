import { Entity, Column } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('vendor_offers')
export class VendorOffer extends BaseModel {
  @Column()
  bookingId: string;

  @Column()
  vendorId: string;

  @Column({ type: 'string', nullable: true })
  offerAddedBy?: string; // User ID who added/submitted the offer

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  offerAmount: number;

  @Column({ type: 'json', nullable: true })
  extraServices?: {
    name: string;
    description?: string;
    price?: number;
  }[];

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  status: OfferStatus;

  @Column({ nullable: true })
  notes?: string;
}

