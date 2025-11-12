import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ServiceCategoryFormInputsService } from './service-category-form-inputs.service';
import { CreateServiceCategoryFormInputDto } from './dto/request/create-service-category-form-input.dto';
import { UpdateServiceCategoryFormInputDto } from './dto/request/update-service-category-form-input.dto';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureType } from '@shared/enums/featureType';

@ApiBearerAuth()
@ApiTags('service-category-form-inputs')
@Controller('service-category-form-inputs')
@UsePipes(new ValidationPipe({ transform: true }))
export class ServiceCategoryFormInputsController {
  constructor(private readonly service: ServiceCategoryFormInputsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  @ApiBody({ type: CreateServiceCategoryFormInputDto })
  create(@Body() dto: CreateServiceCategoryFormInputDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  findAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll(categoryId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  @ApiBody({ type: UpdateServiceCategoryFormInputDto })
  update(@Param('id') id: string, @Body() dto: UpdateServiceCategoryFormInputDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
