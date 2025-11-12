import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategoryFormInput } from './entity/service-category-form-input.entity';
import { ServiceCategoryFormInputsService } from './service-category-form-inputs.service';
import { ServiceCategoryFormInputsController } from './service-category-form-inputs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategoryFormInput], 'mongo')],
  controllers: [ServiceCategoryFormInputsController],
  providers: [ServiceCategoryFormInputsService],
  exports: [ServiceCategoryFormInputsService],
})
export class ServiceCategoryFormInputsModule {}
