import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@shared/enums/bookingStatus';

export class PaymentDetailsResponseDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ required: false })
  paymentMethod?: string;

  @ApiProperty({ required: false })
  transactionId?: string;

  @ApiProperty({
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
  })
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

  @ApiProperty({ required: false })
  paidAt?: Date;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  notes?: string;
}

export class AdditionalServiceResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ required: false })
  description?: string;
}

export class VenueBookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  venueId: string;

  @ApiProperty()
  startDateTime: Date;

  @ApiProperty()
  endDateTime: Date;

  @ApiProperty({ enum: BookingStatus })
  bookingStatus: BookingStatus;

  @ApiProperty({ type: PaymentDetailsResponseDto })
  paymentDetails: PaymentDetailsResponseDto;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ 
    type: [AdditionalServiceResponseDto],
    required: false 
  })
  additionalServices?: AdditionalServiceResponseDto[];

  @ApiProperty({ required: false })
  cancellationReason?: string;

  @ApiProperty({ required: false })
  cancellationDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  updatedBy: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isDeleted: boolean;
}