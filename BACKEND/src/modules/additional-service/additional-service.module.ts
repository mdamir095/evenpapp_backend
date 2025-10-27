import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalService } from './entity/additional-service.entity';
import { AdditionalServiceService } from './additional-service.service';
import { AdditionalServiceController } from './additional-service.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalService], 'mongo')],
  controllers: [AdditionalServiceController],
  providers: [AdditionalServiceService],
  exports: [AdditionalServiceService],
})
export class AdditionalServiceModule {}
