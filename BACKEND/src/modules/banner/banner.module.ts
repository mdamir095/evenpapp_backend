import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entity/banner.entity';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Banner], 'mongo')],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}

