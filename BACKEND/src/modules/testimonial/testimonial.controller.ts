import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto } from './dto/request/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/request/update-testimonial.dto';

@ApiTags('Testimonial')
@Controller('testimonial')
export class TestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Post()
  @ApiOperation({ summary: 'Create a testimonial' })
  create(@Body() dto: CreateTestimonialDto) {
    return this.testimonialService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List testimonials (admin)' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'isActive', type: Boolean, required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('isActive') isActive?: string,
  ) {
    return this.testimonialService.findAll(page, limit, isActive === undefined ? undefined : isActive === 'true');
  }

  @Get('mobile')
  @ApiOperation({ summary: 'Get active testimonials for mobile app' })
  findActiveForMobile() {
    return this.testimonialService.findActiveForMobile();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testimonialService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
    return this.testimonialService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testimonialService.remove(id);
  }
}

