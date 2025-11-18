import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ServiceCategoryFormInputsService } from './service-category-form-inputs.service';
import { CreateServiceCategoryFormInputDto } from './dto/request/create-service-category-form-input.dto';
import { UpdateServiceCategoryFormInputDto } from './dto/request/update-service-category-form-input.dto';
import { SERVICE_CATEGORY_FORM_LABELS, SERVICE_CATEGORY_FORM_LABEL_GROUPS } from './dto/request/create-service-category-form-input.dto';
import { ApiBearerAuth, ApiTags, ApiQuery, ApiBody, ApiOkResponse } from '@nestjs/swagger';
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
  @ApiBody({
    type: CreateServiceCategoryFormInputDto,
    examples: {
      default: {
        summary: 'Create form input',
        value: {
          categoryId: '507f1f77bcf86cd799439011',
          label: 'Number of Guests',
          active: true,
          minrange: 1,
          maxrange: 5000,
        },
      },
    },
  })
  create(@Body() dto: CreateServiceCategoryFormInputDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  findAll(@Query('categoryId') categoryId?: string) {
    return this.service.findAll(categoryId);
  }

  @Get('label')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.SERVICE_CATEGORY)
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Optional category identifier to filter labels (e.g., event, catering)',
    enum: Object.keys(SERVICE_CATEGORY_FORM_LABEL_GROUPS),
  })
  @ApiOkResponse({ description: 'Dropdown labels', schema: { type: 'array', items: { type: 'string', enum: SERVICE_CATEGORY_FORM_LABELS } } })
  getLabelOptions(@Query('category') category?: string) {
    if (!category) {
      return SERVICE_CATEGORY_FORM_LABELS;
    }

    const key = category.toLowerCase();
    const group = SERVICE_CATEGORY_FORM_LABEL_GROUPS[key];
    if (!group) {
      return SERVICE_CATEGORY_FORM_LABELS;
    }

    return group;
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
  @ApiBody({
    type: UpdateServiceCategoryFormInputDto,
    examples: {
      default: {
        summary: 'Update form input',
        value: {
          label: 'Guests',
          active: false,
          minrange: 2,
          maxrange: 4000,
        },
      },
    },
  })
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
