import { ApiProperty } from '@nestjs/swagger';
import { BookingUserResponseDto } from './booking-user-response.dto';

export class BookingUserListResponseDto {
  @ApiProperty({ type: [BookingUserResponseDto] })
  bookings: BookingUserResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}


