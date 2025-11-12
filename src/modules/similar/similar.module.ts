import { Module } from '@nestjs/common';
import { SimilarController } from './similar.controller';
import { SimilarService } from './similar.service';
import { VendorModule } from '../vendor/vendor.module';
import { VenueModule } from '../venue/venue.module';

@Module({
  imports: [VendorModule, VenueModule],
  controllers: [SimilarController],
  providers: [SimilarService],
})
export class SimilarModule {}

