import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServingStyle } from './entity/serving-style.entity';
import { ServingStyleService } from './serving-style.service';
import { ServingStyleController } from './serving-style.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServingStyle], 'mongo')],
  controllers: [ServingStyleController],
  providers: [ServingStyleService],
  exports: [ServingStyleService],
})
export class ServingStyleModule {}


