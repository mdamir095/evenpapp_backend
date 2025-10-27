import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './entity/rating.entity';
import { VendorModule } from '@modules/vendor/vendor.module';
import { VenueModule } from '@modules/venue/venue.module';
import { BookingModule } from '@modules/booking/booking.module';
import { VenueBookingModule } from '@modules/venue-booking/venue-booking.module';
import { UserModule } from '@modules/user/user.module';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rating],'mongo'),
    forwardRef(() => VendorModule),
    forwardRef(() => VenueModule),
    forwardRef(() => BookingModule),
    forwardRef(() => VenueBookingModule),
    forwardRef(() => UserModule),
  ],
  providers: [RatingService],
  controllers: [RatingController],
  exports: [RatingService,TypeOrmModule.forFeature([Rating],'mongo')],
})
export class RatingModule {}
