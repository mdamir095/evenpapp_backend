import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorCategoryService } from './vendor-category.service';
import { VendorCategoryController } from './vendor-category.controller';
import { VendorCategory } from './entity/vendor-category.entity';
import { FormModule } from '@modules/form/form.module';

@Module({
    imports: [TypeOrmModule.forFeature([VendorCategory], 'mongo'),
    FormModule],
    controllers: [VendorCategoryController],
    providers: [VendorCategoryService],
    exports: [VendorCategoryService],
})
export class VendorCategoryModule {

}
