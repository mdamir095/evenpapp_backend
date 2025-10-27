import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueCategoryService } from './venue-category.service';
import { VenueCategoryController } from './venue-category.controller';
import { VenueCategory } from './entity/venue-category.entity';
import { FormModule } from '@modules/form/form.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([VenueCategory], 'mongo'),
        FormModule
    ],
    controllers: [VenueCategoryController],
    providers: [VenueCategoryService],
    exports: [VenueCategoryService],
})
export class VenueCategoryModule {

}
