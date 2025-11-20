import { Entity, Column, ObjectId } from 'typeorm';
import { BaseModel } from '@shared/entities/base.entity';
import { BookingStatus } from '@shared/enums/bookingStatus';
import { BookingType } from '@shared/enums/bookingType';
import { BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
export enum TimeSlot {
  MORNING = 'Morning',
  AFTERNOON = 'Afternoon',
  EVENING = 'Evening',
  NIGHT = 'Night',
}
@Entity('bookings')
export class Booking extends BaseModel {
  @Column({ unique: true })
  bookingId: string;

  @BeforeInsert()
  generateBookingId() {
    if (!this.bookingId) {
      const short = uuidv4().split('-')[0].toUpperCase();
      this.bookingId = `BK-${short}`;
    }
  }

  @BeforeInsert()
  setDefaultBookingStatus() {
    if (!this.bookingStatus) {
      this.bookingStatus = BookingStatus.PENDING;
    }
  }
  @Column()
  eventHall: string;

  @Column()
  venueId: string;

  @Column()
  userId: string;
 
  @Column()
  eventDate: string

  @Column()
  endDate: string

  @Column()
  startTime: string

  @Column()
  endTime: string

  @Column({
    type: 'enum',
    enum: TimeSlot,
    nullable: true,
  })
  timeSlot?: TimeSlot

  @Column({ nullable: true })
  venueAddress?: string

  @Column({ nullable: true })
  specialRequirement?: string

  @Column({ type: 'int', nullable: true })
  expectedGuests?: number

  @Column({ nullable: true })
  photographerType?: string

  @Column({ nullable: true })
  categoryId?: string
  
  @Column({ nullable: true })
  categoryType?: string

  @Column({ type: 'int', nullable: true })
  coverageDuration?: number

  @Column({ type: 'int', nullable: true })
  numberOfPhotographers?: number

  @Column({ type: 'int', nullable: true })
  budgetRange?: number

  @Column({ type: 'simple-array', nullable: true })
  referenceImages?: string[]

  @Column({ nullable: true })
  mealType?: string

  @Column({ nullable: true })
  cuisine?: string

  @Column({ nullable: true })
  servingStyle?: string

  @Column({ nullable: true })
  additionalService?: string

  @Column({ nullable: true })
  foodPreference?: string

  @Column({
    type: 'enum',
    enum: BookingType,
    nullable: false,
  })
  bookingType: BookingType

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

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  rejectionDate?: Date;

  @Column({ type: 'boolean', default: false })
  hasOffers?: boolean;
}
