import { Module } from '@nestjs/common';
import { Vendor } from './entity/vendor.entity';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RatingModule } from '@modules/rating/rating.module';
import { ServiceCategory } from '../service-category/entity/service-category.entity';
import { forwardRef } from '@nestjs/common';
import { LocationModule } from '@modules/location/location.module';
@Module({
    imports: [TypeOrmModule.forFeature([Vendor, ServiceCategory, User ], 'mongo'),
    forwardRef(() => RatingModule), LocationModule],
    controllers: [VendorController],
    providers: [VendorService],
    exports: [VendorService,TypeOrmModule.forFeature([Vendor],'mongo')],
})
export class VendorModule {}
