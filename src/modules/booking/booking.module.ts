import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BookingService } from './booking.service'
import { BookingController } from './booking.controller'
import { Booking } from './entities/booking.entity'
import { VendorOffer } from './entities/vendor-offer.entity'
import { AdminOffer } from './entities/admin-offer.entity'
import { Offer } from './entities/offer.entity'
import { Venue } from '../venue/entity/venue.entity'
import { Vendor } from '../vendor/entity/vendor.entity'
import { VendorCategory } from '../vendor-category/entity/vendor-category.entity'
import { Event } from '@modules/event/entities/event.entity'
import { PhotographyType } from '@modules/quotation-request/entity/photography-type.entity'
import { AwsModule } from '@core/aws/aws.module'
import { AwsS3Service } from '@core/aws/services/aws-s3.service'
import { ConfigModule } from '@nestjs/config'
import { LocationModule } from '@modules/location/location.module'
import { UserModule } from '@modules/user/user.module'
import { SupabaseModule } from '@shared/modules/supabase/supabase.module'
import { ChatModule } from '@modules/chat/chat.module'
import { NotificationModule } from '@modules/notification/notification.module'

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [Booking, VendorOffer, AdminOffer, Offer, Venue, Vendor, VendorCategory, Event, PhotographyType],
      'mongo',
    ),
    AwsModule,
    ConfigModule,
    LocationModule,
    UserModule,
    SupabaseModule,
    forwardRef(() => ChatModule),
    NotificationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, AwsS3Service],
  exports: [BookingService],
})
export class BookingModule {}


