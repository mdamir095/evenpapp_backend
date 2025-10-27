import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoryService } from './service-category.service';
import { ServiceCategoryController } from './service-category.controller';
import { ServiceCategory } from './entity/service-category.entity';
import { Form } from '@modules/form/entity/form.entity';
import { FormModule } from '@modules/form/form.module';

@Module({
    imports: [TypeOrmModule.forFeature([ServiceCategory, Form], 'mongo')],
    controllers: [ServiceCategoryController],
    providers: [ServiceCategoryService],
    exports: [ServiceCategoryService],
})
export class ServiceCategoryModule {

}
