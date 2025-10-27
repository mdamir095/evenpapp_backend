import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldsService } from './field.service';
import { FieldsController } from './field.controller';
import { Field } from './entity/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Field], 'mongo')],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldModule {}
