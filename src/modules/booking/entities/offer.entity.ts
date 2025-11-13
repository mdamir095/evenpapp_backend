import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';
import { v4 as uuidv4 } from 'uuid';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('offers')
export class Offer extends BaseModel {
  @Column({ unique: true })
  offerId: string;

  @BeforeInsert()
  generateOfferId() {
    if (!this.offerId) {
      const short = uuidv4().split('-')[0].toUpperCase();
      this.offerId = `OFFER-${short}`;
    }
  }

  @Column()
  bookingId: string;

  @Column()
  userId: string; // User/Vendor ID who submitted the offer

  @Column({ nullable: true })
  offerAddedBy?: string; // User ID who actually added/submitted the offer (may differ from userId)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'simple-array', nullable: true })
  extraServices?: string[];

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.PENDING,
  })
  status: OfferStatus;

  @Column({ nullable: true })
  notes?: string;
}

