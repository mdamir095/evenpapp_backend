import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';

@Module({
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
  imports: [
      TypeOrmModule.forFeature([Feature], 'mongo'),
  ],
})
export class FeatureModule {}
