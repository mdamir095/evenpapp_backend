import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueBookingService } from './venue-booking.service';
import { VenueBookingController } from './venue-booking.controller';
import { VenueBooking } from './entities/venue-booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VenueBooking], 'mongo')
  ],
  controllers: [VenueBookingController],
  providers: [VenueBookingService],
  exports: [VenueBookingService],
})
export class VenueBookingModule {}