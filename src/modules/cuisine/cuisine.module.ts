import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cuisine } from './entity/cuisine.entity';
import { CuisineService } from './cuisine.service';
import { CuisineController } from './cuisine.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cuisine], 'mongo')],
  controllers: [CuisineController],
  providers: [CuisineService],
  exports: [CuisineService],
})
export class CuisineModule {}


