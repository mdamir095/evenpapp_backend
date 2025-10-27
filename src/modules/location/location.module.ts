import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entity/location.entity';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { Vendor } from '../vendor/entity/vendor.entity';
import { Venue } from '../venue/entity/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Vendor, Venue], 'mongo')],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}

