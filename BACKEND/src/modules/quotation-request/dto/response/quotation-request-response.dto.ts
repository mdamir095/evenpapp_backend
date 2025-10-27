import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class QuotationRequestResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Name of the event hall' })
  @Expose()
  eventHall: string;

  @ApiProperty({ description: 'Start date of the event' })
  @Expose()
  eventDate: Date;

  @ApiProperty({ description: 'End date of the event' })
  @Expose()
  endDate: Date;

  @ApiProperty({ description: 'Start time of the event' })
  @Expose()
  startTime: string;

  @ApiProperty({ description: 'End time of the event' })
  @Expose()
  endTime: string;

  @ApiProperty({ description: 'Address of the venue' })
  @Expose()
  venueAddress: string;

  @ApiProperty({ description: 'Type of photographer needed' })
  @Expose()
  photographerType: string;

  @ApiProperty({ description: 'Special requirements for the event' })
  @Expose()
  specialRequirement: string;

  @ApiProperty({ description: 'Expected number of guests' })
  @Expose()
  expectedGuests: number;

  @ApiProperty({ description: 'Coverage duration in hours' })
  @Expose()
  coverageDuration: number;

  @ApiProperty({ description: 'Number of photographers needed' })
  @Expose()
  numberOfPhotographers: number;

  @ApiProperty({ description: 'Budget range for the event' })
  @Expose()
  budgetRange: number;

  @ApiProperty({ description: 'Array of reference images in base64 format' })
  @Expose()
  referenceImages: string[];

  @ApiProperty({ description: 'Status of the quotation request' })
  @Expose()
  status: string;

  @ApiProperty({ description: 'ID of the user making the request' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'ID of the vendor' })
  @Expose()
  vendorId: string;

  @ApiProperty({ description: 'ID of the venue' })
  @Expose()
  venueId: string;

  @ApiProperty({ description: 'Quotation amount provided by vendor' })
  @Expose()
  quotationAmount: number;

  @ApiProperty({ description: 'Additional notes' })
  @Expose()
  notes: string;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt: Date;
}
