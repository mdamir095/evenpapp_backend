import { Entity, Column, ObjectId } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';
import { BookingStatus } from '@shared/enums/bookingStatus';

@Entity('venue_bookings')
export class VenueBooking extends BaseModel {
  @Column()
  eventId: string;

  @Column()
  venueId: string;

  @Column()
  startDateTime: Date;

  @Column()
  endDateTime: Date;

  @Column({ 
    type: 'enum', 
    enum: BookingStatus, 
    default: BookingStatus.PENDING 
  })
  bookingStatus: BookingStatus;

  @Column({ type: 'json', nullable: true })
  paymentDetails: {
    amount: number;
    currency: string;
    paymentMethod?: string;
    transactionId?: string;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    paidAt?: Date;
    dueDate?: Date;
    notes?: string;
  };

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'json', nullable: true })
  additionalServices?: {
    name: string;
    price: number;
    description?: string;
  }[];

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  cancellationDate?: Date;
}