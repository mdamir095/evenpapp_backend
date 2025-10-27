import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('quotation_requests')
export class QuotationRequest {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  eventHall: string;

  @Column()
  eventDate: Date;

  @Column()
  endDate: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  venueAddress: string;

  @Column()
  photographerType: string;

  @Column()
  specialRequirement: string;

  @Column()
  expectedGuests: number;

  @Column()
  coverageDuration: number;

  @Column()
  numberOfPhotographers: number;

  @Column()
  budgetRange: number;

  @Column('array')
  referenceImages: string[];

  @Column({ default: 'pending' })
  status: string; // pending, approved, rejected, completed

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  vendorId: string;

  @Column({ nullable: true })
  venueId: string;

  @Column({ nullable: true })
  quotationAmount: number;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
