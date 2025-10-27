import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '@common/guards/features.guard';
import { Features } from '@common/decorators/permission.decorator';
import { FeatureType } from '@shared/enums/featureType';
import { MealTypeService } from './meal-type.service';
import { CreateMealTypeDto } from './dto/request/create-meal-type.dto';
import { UpdateMealTypeDto } from './dto/request/update-meal-type.dto';
import { UpdateMealTypeStatusDto } from './dto/request/update-meal-type-status.dto';
import { MealTypeResponseDto } from './dto/response/meal-type.dto';
import { IPagination } from '@common/interfaces/pagination.interface';

@ApiTags('Meal Types')
@Controller('meal-types')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true }))
export class MealTypeController {
  constructor(private readonly service: MealTypeService) {}

  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all meal types for user' })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAllForUser(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<IPagination<MealTypeResponseDto>> {
    return this.service.findAll(page, limit, search);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard('jwt'))
  findOneForUser(@Param('id') id: string): Promise<MealTypeResponseDto> {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.MEAL_TYPE)
  create(@Body() dto: CreateMealTypeDto): Promise<MealTypeResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.MEAL_TYPE)
  @ApiOperation({ summary: 'Get all meal types' })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string = '',
  ): Promise<IPagination<MealTypeResponseDto>> {
    return this.service.findAll(page, limit, search);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.MEAL_TYPE)
  findOne(@Param('id') id: string): Promise<MealTypeResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.MEAL_TYPE)
  update(@Param('id') id: string, @Body() dto: UpdateMealTypeDto): Promise<MealTypeResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.MEAL_TYPE)
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), FeatureGuard)
  @Features(FeatureType.MEAL_TYPE)
  @ApiOperation({ summary: 'Update meal type active status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMealTypeStatusDto,
  ): Promise<{ message: string }> {
    return this.service.updateStatus(id, dto.isActive);
  }
}


