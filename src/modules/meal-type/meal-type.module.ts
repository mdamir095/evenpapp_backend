import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealType } from './entity/meal-type.entity';
import { MealTypeService } from './meal-type.service';
import { MealTypeController } from './meal-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MealType], 'mongo')],
  controllers: [MealTypeController],
  providers: [MealTypeService],
  exports: [MealTypeService],
})
export class MealTypeModule {}


