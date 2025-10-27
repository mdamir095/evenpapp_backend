import { BaseModel } from '@shared/entities/base.entity';
import { Column, Entity } from 'typeorm';


@Entity('ratings')
export class Rating extends BaseModel {
  @Column()
  userId: string;

  @Column()
  bookingId: string; // ID of the booking that validates this rating

  @Column()
  entityId: string; // ID of the vendor or venue

  @Column()
  entityType: 'vendor' | 'venue'; // To distinguish between vendor and venue ratings

  @Column()
  score: number; // Rating score (e.g., 1 to 5)

  @Column({ nullable: true })
  review?: string; // Optional review text
}
