import { BaseModel } from '@shared/entities/base.entity';
import { OfferStatus } from '@shared/enums/offerStatus';
import { OfferType } from '@shared/enums/offerType';
import { Entity, Column } from 'typeorm';


@Entity('offers')
export class Offer extends BaseModel {
  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  type: OfferType;

  @Column()
  discountValue: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: OfferStatus.INACTIVE })
  status: OfferStatus;

  @Column({ nullable: true })
  couponCode?: string;

  @Column({ nullable: true })
  usageLimit?: number;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ nullable: true })
  imageUrl?: string;

}

