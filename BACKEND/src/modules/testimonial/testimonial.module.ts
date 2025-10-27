import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './entity/testimonial.entity';
import { TestimonialService } from './testimonial.service';
import { TestimonialController } from './testimonial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial], 'mongo')],
  controllers: [TestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}

