import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuotationRequest } from './entity/quotation-request.entity';
import { EventType } from './entity/event-type.entity';
import { PhotographyType } from './entity/photography-type.entity';
import { QuotationRequestService } from './quotation-request.service';
import { QuotationRequestController } from './quotation-request.controller';
import { AwsModule } from '@core/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuotationRequest, EventType, PhotographyType], 'mongo'),
    AwsModule,
  ],
  controllers: [QuotationRequestController],
  providers: [QuotationRequestService],
  exports: [QuotationRequestService],
})
export class QuotationRequestModule {}
