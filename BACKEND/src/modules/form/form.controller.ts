import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/request/create-form.dto';
import { Form } from './entity/form.entity';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateFormDto } from './dto/request/update-form.dto';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureGuard } from '@common/guards/features.guard';
import { AuthGuard } from '@nestjs/passport';
import { FormPaginatedResponseDto } from './dto/response/form-paginated.dto';
import { FeatureType } from '@shared/enums/featureType';

@ApiTags('Forms')
@Controller('forms')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt'), FeatureGuard)
@Features(FeatureType.FORM_BUILDER)
export class FormController {
  constructor(private readonly service: FormService) {}

  @ApiOperation({ summary: 'Create a new form' })
  @Post()
  create(@Body() dto: CreateFormDto): Promise<Form> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Get all forms with pagination and optional type filter' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Page size (default 10)' })
  @ApiQuery({ name: 'type', type: String, required: false, description: 'Filter forms by type (e.g., venue-category, event, etc.)' })
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type?: string,
  ): Promise<FormPaginatedResponseDto> {
    return this.service.findAll(page, limit, type);
  }

  @ApiOperation({ summary: 'Get a form by key' })
  @Get(':key')
  findOne(@Param('key') key: string): Promise<Form> {
    return this.service.findOne(key);
  }

  @ApiOperation({ summary: 'Update a form by key' })
  @Put(':key')
  update(@Param('key') key: string, @Body() dto: UpdateFormDto): Promise<Form> {
    return this.service.update(key, dto);
  }

  @ApiOperation({ summary: 'Delete a form by key' })
  @Delete(':key')
  delete(@Param('key') key: string): Promise<{ message: string }> {
    return this.service.delete(key);
  }

  @ApiOperation({ summary: 'Get form by category id' })
  @Get('category/:categoryId')
  findByCategoryId(@Param('categoryId') categoryId: string): Promise<Form | null> {
    return this.service.findByCategoryId(categoryId);
  }
}
