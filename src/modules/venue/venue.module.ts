import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venue } from './entity/venue.entity';
import { VenueService } from './venue.service';
import { VenueController } from './venue.controller';
import { LocationModule } from '@modules/location/location.module';
import { RatingModule } from '../rating/rating.module';
import { VenueFormValidator } from './helpers/venue-form-validator';
import { VenueCategoryModule } from '@modules/venue-category/venue-category.module';
import { ServiceCategory } from '../service-category/entity/service-category.entity';
import { forwardRef } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venue, ServiceCategory, User], 'mongo'),
    VenueCategoryModule,
    LocationModule,
    forwardRef(() => RatingModule),
  ],
  controllers: [VenueController],
  providers: [VenueService, VenueFormValidator],
  exports: [VenueService],
})
export class VenueModule {}
